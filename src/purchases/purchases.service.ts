import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Purchase, PaymentStatus } from '../entities/purchase.entity';
import { Ticket } from '../entities/ticket.entity';
import { Raffle, RaffleStatus } from '../entities/raffle.entity';
import { CreatePurchaseDto, TICKET_PRICE, MIN_TICKETS, PACKAGES } from './purchases.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,

    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

    @InjectRepository(Raffle)
    private raffleRepo: Repository<Raffle>,

    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  getPackages() {
    return {
      pricePerNumber: TICKET_PRICE,
      minimumPurchase: MIN_TICKETS,
      minimumTotal: MIN_TICKETS * TICKET_PRICE,
      packages: PACKAGES,
      payment: {
        method: 'Nequi',
        number: process.env.NEQUI_NUMBER || '3126324715',
        name: process.env.NEQUI_NAME || 'Jesus David Gonzalez Tapias',
      },
    };
  }

  async create(raffleId: string, dto: CreatePurchaseDto) {
    const raffle = await this.raffleRepo.findOne({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException('Rifa no encontrada');
    if (raffle.status !== RaffleStatus.OPEN) {
      throw new BadRequestException('Esta rifa no está abierta para compras');
    }

    const totalAmount = dto.quantity * Number(raffle.pricePerNumber || TICKET_PRICE);

    return this.dataSource.transaction(async (manager) => {
      const availableTickets = await manager
        .createQueryBuilder(Ticket, 'ticket')
        .where('ticket.raffleId = :raffleId', { raffleId })
        .andWhere('ticket.purchaseId IS NULL')
        .orderBy('RAND()')
        .limit(dto.quantity)
        .setLock('pessimistic_write')
        .getMany();

      if (availableTickets.length < dto.quantity) {
        throw new BadRequestException(
          `Solo quedan ${availableTickets.length} números disponibles.`,
        );
      }

      const purchase = manager.create(Purchase, {
        raffleId,
        buyerName: dto.buyerName,
        buyerPhone: dto.buyerPhone,
        buyerEmail: dto.buyerEmail,
        buyerCity: dto.buyerCity,
        quantity: dto.quantity,
        totalAmount,
        status: PaymentStatus.PENDING,
      });
      const savedPurchase = await manager.save(Purchase, purchase);

      await manager.update(
        Ticket,
        availableTickets.map((t) => t.id),
        { purchaseId: savedPurchase.id },
      );

      return {
        message: 'Números reservados. Ahora realiza el pago y sube el comprobante.',
        purchase: savedPurchase,
        quantity: dto.quantity,
        pricePerNumber: raffle.pricePerNumber,
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

  async uploadVoucher(purchaseId: string, filePath: string) {
    const purchase = await this.purchaseRepo.findOne({
      where: { id: purchaseId },
      relations: ['raffle'],
    });
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    if (purchase.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Esta compra ya tiene un comprobante o fue procesada');
    }

    purchase.voucherPath = filePath;
    purchase.status = PaymentStatus.REVIEW;
    await this.purchaseRepo.save(purchase);

    // Notificar al admin (sin await para no bloquear)
    this.mailService.sendComprobantNotification(purchase, purchase.raffle?.title || 'Rifa');

    return {
      message: 'Comprobante recibido. El administrador revisará tu pago y recibirás tus números por email.',
      purchaseId,
      status: PaymentStatus.REVIEW,
    };
  }

  async approvePurchase(purchaseId: string) {
    const purchase = await this.purchaseRepo.findOne({
      where: { id: purchaseId },
      relations: ['tickets', 'raffle'],
    });
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    if (purchase.status === PaymentStatus.PAID) {
      throw new BadRequestException('Esta compra ya fue aprobada');
    }

    purchase.status = PaymentStatus.PAID;
    purchase.confirmedAt = new Date();
    purchase.paymentProvider = 'Nequi';
    await this.purchaseRepo.save(purchase);

    const tickets = await this.ticketRepo.find({
      where: { purchaseId },
      select: ['number', 'isBlessed'],
      order: { number: 'ASC' },
    });

    // Enviar email sin await para no bloquear la respuesta
    this.mailService.sendNumbersToClient(
      purchase,
      tickets,
      purchase.raffle?.title || 'Rifa',
      purchase.raffle?.prize || '',
      Number(purchase.raffle?.blessedPrize || 50000),
    );

    return {
      message: 'Compra aprobada. Los números fueron enviados al cliente por email.',
      purchase,
      numbers: tickets,
    };
  }

  async rejectPurchase(purchaseId: string) {
    return this.dataSource.transaction(async (manager) => {
      const purchase = await manager.findOne(Purchase, {
        where: { id: purchaseId },
      });
      if (!purchase) throw new NotFoundException('Compra no encontrada');
      if (purchase.status === PaymentStatus.PAID) {
        throw new BadRequestException('No se puede rechazar una compra ya aprobada');
      }

      await manager.update(Ticket, { purchaseId }, { purchaseId: null });
      purchase.status = PaymentStatus.FAILED;
      await manager.save(Purchase, purchase);

      // Notificar al cliente sin await
      this.mailService.sendRejectionToClient(purchase);

      return { message: 'Compra rechazada. Números liberados y cliente notificado.' };
    });
  }

  async findByRaffle(raffleId: string) {
    const purchases = await this.purchaseRepo.find({
      where: { raffleId },
      order: { createdAt: 'DESC' },
    });

    const result = await Promise.all(
      purchases.map(async (p) => {
        const blessedCount = await this.ticketRepo.count({
          where: { purchaseId: p.id, isBlessed: true },
        });
        return { ...p, hasBlessedNumber: blessedCount > 0, blessedNumbers: blessedCount };
      })
    );
    return result;
  }

  async findOne(id: string) {
    const purchase = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['tickets'],
    });
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    return purchase;
  }

  async cancelPurchase(purchaseId: string) {
    return this.dataSource.transaction(async (manager) => {
      const purchase = await manager.findOne(Purchase, { where: { id: purchaseId } });
      if (!purchase) throw new NotFoundException('Compra no encontrada');
      if (purchase.status === PaymentStatus.PAID) {
        throw new BadRequestException('No se puede cancelar una compra ya pagada');
      }
      await manager.update(Ticket, { purchaseId }, { purchaseId: null });
      purchase.status = PaymentStatus.FAILED;
      return manager.save(Purchase, purchase);
    });
  }
}