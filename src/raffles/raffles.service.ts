import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Raffle, RaffleStatus } from '../entities/raffle.entity';
import { Ticket } from '../entities/ticket.entity';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from './raffles.dto';

const DEFAULT_PACKAGES = [
  { quantity: 25,  label: 'Paquete Básico' },
  { quantity: 50,  label: 'Paquete Bronce' },
  { quantity: 75,  label: 'Paquete Plata' },
  { quantity: 100, label: 'Paquete Oro' },
  { quantity: 200, label: 'Paquete Diamante' },
];

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle) private raffleRepo: Repository<Raffle>,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
  ) {}

  async create(dto: CreateRaffleDto, prizeImagePath?: string) {
    const blessedCount = dto.blessedCount ?? 10;
    const blessedPrize = dto.blessedPrize ?? 50000;

    // packages puede venir como string JSON desde FormData
    let packages = dto.packages || DEFAULT_PACKAGES;
    if (typeof (packages as any) === 'string') {
      try { packages = JSON.parse(packages as any); } catch { packages = DEFAULT_PACKAGES; }
    }

    const raffle = this.raffleRepo.create({
      ...dto,
      drawDate: dto.drawDate ? new Date(dto.drawDate) : null,
      packages,
      blessedCount,
      blessedPrize,
      prizeImage: prizeImagePath || null,
      status: RaffleStatus.OPEN,
    });
    const saved = await this.raffleRepo.save(raffle);

    const allNumbers = Array.from({ length: 10000 }, (_, i) => i.toString().padStart(4, '0'));
    const shuffled = [...allNumbers].sort(() => Math.random() - 0.5);
    const blessedNumbers = new Set(shuffled.slice(0, blessedCount));

    const tickets: Partial<Ticket>[] = allNumbers.map(number => ({
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

  async update(id: string, dto: UpdateRaffleDto, prizeImagePath?: string) {
    const raffle = await this.findOne(id);
    if (dto.title)          raffle.title = dto.title;
    if (dto.description !== undefined) raffle.description = dto.description!;
    if (dto.prize)          raffle.prize = dto.prize;
    if (dto.pricePerNumber) raffle.pricePerNumber = dto.pricePerNumber;
    if (dto.drawDate)       raffle.drawDate = new Date(dto.drawDate);
    if (dto.packages)       raffle.packages = dto.packages;
    if (dto.blessedPrize)   raffle.blessedPrize = dto.blessedPrize;
    if (prizeImagePath)     raffle.prizeImage = prizeImagePath;
    return this.raffleRepo.save(raffle);
  }

  // Obtener la rifa activa más reciente (para página de una sola rifa)
  async getActive() {
    const raffle = await this.raffleRepo.findOne({
      where: { status: RaffleStatus.OPEN },
      order: { createdAt: 'DESC' },
    });
    if (!raffle) throw new NotFoundException('No hay rifas activas');
    return raffle;
  }

  async findAll() { return this.raffleRepo.find({ order: { createdAt: 'DESC' } }); }

  async findOne(id: string) {
    const raffle = await this.raffleRepo.findOne({ where: { id } });
    if (!raffle) throw new NotFoundException('Rifa no encontrada');
    return raffle;
  }

  async updateStatus(id: string, dto: UpdateRaffleStatusDto) {
    const raffle = await this.findOne(id);
    raffle.status = dto.status;
    return this.raffleRepo.save(raffle);
  }

  async getStats(id: string) {
    await this.findOne(id);
    const sold = await this.ticketRepo.count({ where: { raffleId: id, purchaseId: Not(IsNull()) } });
    const blessedSold = await this.ticketRepo.count({ where: { raffleId: id, isBlessed: true, purchaseId: Not(IsNull()) } });
    return { totalNumbers: 10000, sold, available: 10000 - sold, percentageSold: Math.round((sold / 10000) * 10000) / 100, blessedSold };
  }

  async getBlessedNumbers(id: string) {
    await this.findOne(id);
    const tickets = await this.ticketRepo.find({
      where: { raffleId: id, isBlessed: true },
      select: ['number', 'purchaseId'],
      order: { number: 'ASC' },
    });
    return tickets.map(t => ({ number: t.number, taken: !!t.purchaseId }));
  }

  async getSoldNumbers(id: string) {
    await this.findOne(id);
    const tickets = await this.ticketRepo.find({
      where: { raffleId: id, purchaseId: Not(IsNull()) },
      select: ['number', 'isBlessed'],
      order: { number: 'ASC' },
    });
    return tickets.map(t => ({ number: t.number, isBlessed: t.isBlessed }));
  }

  async getAvailableNumbers(id: string) {
    await this.findOne(id);
    const tickets = await this.ticketRepo.find({
      where: { raffleId: id, purchaseId: IsNull() },
      select: ['number', 'isBlessed'],
      order: { number: 'ASC' },
    });
    return tickets.map(t => ({ number: t.number, isBlessed: t.isBlessed }));
  }
}
