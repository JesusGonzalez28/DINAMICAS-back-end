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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_entity_1 = require("../entities/purchase.entity");
const ticket_entity_1 = require("../entities/ticket.entity");
const raffle_entity_1 = require("../entities/raffle.entity");
const purchases_dto_1 = require("./purchases.dto");
const mail_service_1 = require("../mail/mail.service");
let PurchasesService = class PurchasesService {
    constructor(purchaseRepo, ticketRepo, raffleRepo, dataSource, mailService) {
        this.purchaseRepo = purchaseRepo;
        this.ticketRepo = ticketRepo;
        this.raffleRepo = raffleRepo;
        this.dataSource = dataSource;
        this.mailService = mailService;
    }
    getPackages() {
        return {
            pricePerNumber: purchases_dto_1.TICKET_PRICE,
            minimumPurchase: purchases_dto_1.MIN_TICKETS,
            minimumTotal: purchases_dto_1.MIN_TICKETS * purchases_dto_1.TICKET_PRICE,
            packages: purchases_dto_1.PACKAGES,
            payment: {
                method: 'Nequi',
                number: process.env.NEQUI_NUMBER || '3126324715',
                name: process.env.NEQUI_NAME || 'Jesus David Gonzalez Tapias',
            },
        };
    }
    async create(raffleId, dto) {
        const raffle = await this.raffleRepo.findOne({ where: { id: raffleId } });
        if (!raffle)
            throw new common_1.NotFoundException('Rifa no encontrada');
        if (raffle.status !== raffle_entity_1.RaffleStatus.OPEN) {
            throw new common_1.BadRequestException('Esta rifa no está abierta para compras');
        }
        const totalAmount = dto.quantity * purchases_dto_1.TICKET_PRICE;
        return this.dataSource.transaction(async (manager) => {
            const availableTickets = await manager
                .createQueryBuilder(ticket_entity_1.Ticket, 'ticket')
                .where('ticket.raffleId = :raffleId', { raffleId })
                .andWhere('ticket.purchaseId IS NULL')
                .orderBy('RAND()')
                .limit(dto.quantity)
                .setLock('pessimistic_write')
                .getMany();
            if (availableTickets.length < dto.quantity) {
                throw new common_1.BadRequestException(`Solo quedan ${availableTickets.length} números disponibles.`);
            }
            const purchase = manager.create(purchase_entity_1.Purchase, {
                raffleId,
                buyerName: dto.buyerName,
                buyerPhone: dto.buyerPhone,
                buyerEmail: dto.buyerEmail,
                buyerCity: dto.buyerCity,
                quantity: dto.quantity,
                totalAmount,
                status: purchase_entity_1.PaymentStatus.PENDING,
            });
            const savedPurchase = await manager.save(purchase_entity_1.Purchase, purchase);
            await manager.update(ticket_entity_1.Ticket, availableTickets.map((t) => t.id), { purchaseId: savedPurchase.id });
            return {
                message: 'Números reservados. Ahora realiza el pago y sube el comprobante.',
                purchase: savedPurchase,
                quantity: dto.quantity,
                pricePerNumber: purchases_dto_1.TICKET_PRICE,
                totalAmount,
                totalFormatted: `$${totalAmount.toLocaleString('es-CO')} COP`,
                payment: {
                    method: 'Nequi',
                    number: process.env.NEQUI_NUMBER || '3126324715',
                    name: process.env.NEQUI_NAME || 'Jesus David Gonzalez Tapias',
                },
            };
        });
    }
    async uploadVoucher(purchaseId, filePath) {
        const purchase = await this.purchaseRepo.findOne({
            where: { id: purchaseId },
            relations: ['raffle'],
        });
        if (!purchase)
            throw new common_1.NotFoundException('Compra no encontrada');
        if (purchase.status !== purchase_entity_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Esta compra ya tiene un comprobante o fue procesada');
        }
        purchase.voucherPath = filePath;
        purchase.status = purchase_entity_1.PaymentStatus.REVIEW;
        await this.purchaseRepo.save(purchase);
        await this.mailService.sendComprobantNotification(purchase, purchase.raffle?.title || 'Rifa');
        return {
            message: 'Comprobante recibido. El administrador revisará tu pago y recibirás tus números por email.',
            purchaseId,
            status: purchase_entity_1.PaymentStatus.REVIEW,
        };
    }
    async searchPurchases(query) {
        if (!query || query.trim().length === 0) {
            throw new common_1.BadRequestException('Debes enviar un teléfono o correo para buscar compras');
        }
        const searchTerm = query.trim();
        const purchases = await this.purchaseRepo
            .createQueryBuilder('purchase')
            .where('LOWER(purchase.buyerEmail) = LOWER(:query)', { query: searchTerm })
            .orWhere('purchase.buyerPhone = :query', { query: searchTerm })
            .leftJoinAndSelect('purchase.tickets', 'ticket')
            .leftJoinAndSelect('purchase.raffle', 'raffle')
            .orderBy('purchase.createdAt', 'DESC')
            .getMany();
        if (purchases.length === 0) {
            throw new common_1.NotFoundException('No se encontraron compras con esos datos');
        }
        return purchases.map((purchase) => {
            const tickets = purchase.tickets || [];
            const blessedNumbers = tickets.filter((t) => t.isBlessed).map((t) => parseInt(t.number));
            let statusFrontend = purchase.status;
            if (purchase.status === purchase_entity_1.PaymentStatus.PAID) {
                statusFrontend = 'APPROVED';
            }
            else if (purchase.status === purchase_entity_1.PaymentStatus.FAILED) {
                statusFrontend = 'REJECTED';
            }
            return {
                id: purchase.id,
                raffleId: purchase.raffleId,
                raffleName: purchase.raffle?.title || 'Rifa desconocida',
                buyerName: purchase.buyerName,
                buyerEmail: purchase.buyerEmail,
                buyerPhone: purchase.buyerPhone,
                buyerCity: purchase.buyerCity,
                quantity: purchase.quantity,
                totalAmount: purchase.totalAmount.toString(),
                status: statusFrontend,
                voucherPath: purchase.voucherPath || null,
                hasBlessedNumber: blessedNumbers.length > 0,
                blessedNumbers,
                numbers: tickets.sort((a, b) => parseInt(a.number) - parseInt(b.number)).map((t) => parseInt(t.number)),
                createdAt: purchase.createdAt,
            };
        });
    }
    async approvePurchase(purchaseId) {
        const purchase = await this.purchaseRepo.findOne({
            where: { id: purchaseId },
            relations: ['tickets', 'raffle'],
        });
        if (!purchase)
            throw new common_1.NotFoundException('Compra no encontrada');
        if (purchase.status === purchase_entity_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Esta compra ya fue aprobada');
        }
        purchase.status = purchase_entity_1.PaymentStatus.PAID;
        purchase.confirmedAt = new Date();
        purchase.paymentProvider = 'Nequi';
        await this.purchaseRepo.save(purchase);
        const tickets = await this.ticketRepo.find({
            where: { purchaseId },
            select: ['number', 'isBlessed'],
            order: { number: 'ASC' },
        });
        await this.mailService.sendNumbersToClient(purchase, tickets, purchase.raffle?.title || 'Rifa', purchase.raffle?.prize || '', Number(purchase.raffle?.blessedPrize || 50000));
        return {
            message: 'Compra aprobada. Los números fueron enviados al cliente por email.',
            purchase,
            tickets,
        };
    }
    async rejectPurchase(purchaseId) {
        return this.dataSource.transaction(async (manager) => {
            const purchase = await manager.findOne(purchase_entity_1.Purchase, {
                where: { id: purchaseId },
            });
            if (!purchase)
                throw new common_1.NotFoundException('Compra no encontrada');
            if (purchase.status === purchase_entity_1.PaymentStatus.PAID) {
                throw new common_1.BadRequestException('No se puede rechazar una compra ya aprobada');
            }
            await manager.update(ticket_entity_1.Ticket, { purchaseId }, { purchaseId: null });
            purchase.status = purchase_entity_1.PaymentStatus.FAILED;
            await manager.save(purchase_entity_1.Purchase, purchase);
            await this.mailService.sendRejectionToClient(purchase);
            return { message: 'Compra rechazada. Números liberados y cliente notificado.' };
        });
    }
    async findByRaffle(raffleId) {
        const purchases = await this.purchaseRepo.find({
            where: { raffleId },
            order: { createdAt: 'DESC' },
        });
        const result = await Promise.all(purchases.map(async (p) => {
            const blessedCount = await this.ticketRepo.count({
                where: { purchaseId: p.id, isBlessed: true },
            });
            return { ...p, hasBlessedNumber: blessedCount > 0, blessedNumbers: blessedCount };
        }));
        return result;
    }
    async findOne(id) {
        const purchase = await this.purchaseRepo.findOne({
            where: { id },
            relations: ['tickets'],
        });
        if (!purchase)
            throw new common_1.NotFoundException('Compra no encontrada');
        return purchase;
    }
    async cancelPurchase(purchaseId) {
        return this.dataSource.transaction(async (manager) => {
            const purchase = await manager.findOne(purchase_entity_1.Purchase, { where: { id: purchaseId } });
            if (!purchase)
                throw new common_1.NotFoundException('Compra no encontrada');
            if (purchase.status === purchase_entity_1.PaymentStatus.PAID) {
                throw new common_1.BadRequestException('No se puede cancelar una compra ya pagada');
            }
            await manager.update(ticket_entity_1.Ticket, { purchaseId }, { purchaseId: null });
            purchase.status = purchase_entity_1.PaymentStatus.FAILED;
            return manager.save(purchase_entity_1.Purchase, purchase);
        });
    }
    async getTopBuyers(raffleId) {
        const purchases = await this.purchaseRepo.find({
            where: { raffleId, status: purchase_entity_1.PaymentStatus.PAID },
            order: { quantity: 'DESC' },
        });
        const map = new Map();
        for (const p of purchases) {
            const key = p.buyerEmail;
            if (map.has(key)) {
                const existing = map.get(key);
                existing.totalQuantity += p.quantity;
                existing.totalAmount += Number(p.totalAmount);
                existing.purchases += 1;
            }
            else {
                map.set(key, {
                    buyerName: p.buyerName,
                    buyerEmail: p.buyerEmail,
                    buyerPhone: p.buyerPhone,
                    buyerCity: p.buyerCity,
                    totalQuantity: p.quantity,
                    totalAmount: Number(p.totalAmount),
                    purchases: 1,
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_entity_1.Purchase)),
    __param(1, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __param(2, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        mail_service_1.MailService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map