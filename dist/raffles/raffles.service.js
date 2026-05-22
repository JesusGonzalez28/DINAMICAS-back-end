"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const raffle_entity_1 = require("../entities/raffle.entity");
const ticket_entity_1 = require("../entities/ticket.entity");
const DEFAULT_PACKAGES = [
    { quantity: 25, label: 'Paquete Básico' },
    { quantity: 50, label: 'Paquete Bronce' },
    { quantity: 75, label: 'Paquete Plata' },
    { quantity: 100, label: 'Paquete Oro' },
    { quantity: 200, label: 'Paquete Diamante' },
];
let RafflesService = class RafflesService {
    constructor(raffleRepo, ticketRepo) {
        this.raffleRepo = raffleRepo;
        this.ticketRepo = ticketRepo;
    }
    async create(dto, prizeImagePath) {
        try {
            const blessedCount = dto.blessedCount ?? 10;
            const blessedPrize = dto.blessedPrize ?? 50000;
            let packages = dto.packages || DEFAULT_PACKAGES;
            if (typeof packages === 'string') {
                try {
                    packages = JSON.parse(packages);
                }
                catch {
                    packages = DEFAULT_PACKAGES;
                }
            }
            const raffle = this.raffleRepo.create({
                ...dto,
                drawDate: dto.drawDate ? new Date(dto.drawDate) : null,
                packages,
                blessedCount,
                blessedPrize,
                prizeImage: prizeImagePath || null,
                status: raffle_entity_1.RaffleStatus.OPEN,
            });
            const saved = await this.raffleRepo.save(raffle);
            const allNumbers = Array.from({ length: 10000 }, (_, i) => i.toString().padStart(4, '0'));
            const shuffled = [...allNumbers].sort(() => Math.random() - 0.5);
            const blessedNumbers = new Set(shuffled.slice(0, blessedCount));
            const tickets = allNumbers.map(number => ({
                raffleId: saved.id,
                number,
                isBlessed: blessedNumbers.has(number),
            }));
            const chunkSize = 1000;
            for (let i = 0; i < tickets.length; i += chunkSize) {
                await this.ticketRepo.insert(tickets.slice(i, i + chunkSize));
            }
            return { message: 'Rifa creada exitosamente', raffle: saved, totalTickets: 10000, blessedNumbers: blessedCount };
        }
        catch (error) {
            console.error('Error al crear la rifa:', error);
            throw new common_1.BadRequestException('Error al crear la rifa');
        }
    }
    async update(id, dto, prizeImagePath) {
        const raffle = await this.findOne(id);
        if (dto.title)
            raffle.title = dto.title;
        if (dto.description !== undefined)
            raffle.description = dto.description;
        if (dto.prize)
            raffle.prize = dto.prize;
        if (dto.pricePerNumber)
            raffle.pricePerNumber = dto.pricePerNumber;
        if (dto.drawDate)
            raffle.drawDate = new Date(dto.drawDate);
        if (dto.packages)
            raffle.packages = dto.packages;
        if (dto.blessedPrize)
            raffle.blessedPrize = dto.blessedPrize;
        if (prizeImagePath)
            raffle.prizeImage = prizeImagePath;
        return this.raffleRepo.save(raffle);
    }
    async getActive() {
        const raffle = await this.raffleRepo.findOne({
            where: { status: raffle_entity_1.RaffleStatus.OPEN },
            order: { createdAt: 'DESC' },
        });
        if (!raffle)
            throw new common_1.NotFoundException('No hay rifas activas');
        return raffle;
    }
    async findAll() { return this.raffleRepo.find({ order: { createdAt: 'DESC' } }); }
    async findOne(id) {
        const raffle = await this.raffleRepo.findOne({ where: { id } });
        if (!raffle)
            throw new common_1.NotFoundException('Rifa no encontrada');
        return raffle;
    }
    async updateStatus(id, dto) {
        const raffle = await this.findOne(id);
        raffle.status = dto.status;
        return this.raffleRepo.save(raffle);
    }
    async getStats(id) {
        await this.findOne(id);
        const sold = await this.ticketRepo.count({ where: { raffleId: id, purchaseId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) } });
        const blessedSold = await this.ticketRepo.count({ where: { raffleId: id, isBlessed: true, purchaseId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) } });
        return { totalNumbers: 10000, sold, available: 10000 - sold, percentageSold: Math.round((sold / 10000) * 10000) / 100, blessedSold };
    }
    async getBlessedNumbers(id) {
        await this.findOne(id);
        const tickets = await this.ticketRepo.find({
            where: { raffleId: id, isBlessed: true },
            select: ['number', 'purchaseId'],
            order: { number: 'ASC' },
        });
        return tickets.map(t => ({ number: t.number, taken: !!t.purchaseId }));
    }
    async getSoldNumbers(id) {
        await this.findOne(id);
        const tickets = await this.ticketRepo.find({
            where: { raffleId: id, purchaseId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
            select: ['number', 'isBlessed'],
            order: { number: 'ASC' },
        });
        return tickets.map(t => ({ number: t.number, isBlessed: t.isBlessed }));
    }
    async getAvailableNumbers(id) {
        await this.findOne(id);
        const tickets = await this.ticketRepo.find({
            where: { raffleId: id, purchaseId: (0, typeorm_2.IsNull)() },
            select: ['number', 'isBlessed'],
            order: { number: 'ASC' },
        });
        return tickets.map(t => ({ number: t.number, isBlessed: t.isBlessed }));
    }
};
exports.RafflesService = RafflesService;
exports.RafflesService = RafflesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(1, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RafflesService);
//# sourceMappingURL=raffles.service.js.map