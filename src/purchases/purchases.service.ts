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
import { SettingsService } from '../settings/settings.service';

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
    private settingsService: SettingsService,
  ) {}

  async getPackages() {
    const settings = await this.settingsService.getPublic();
    return {
      pricePerNumber: TICKET_PRICE,
      minimumPurchase: settings.minQuantity,
      minimumTotal: settings.minQuantity * TICKET_PRICE,
      packages: PACKAGES,
      payment: {
        method: 'Nequi',
        number: settings.nequiNumber,
        name: settings.nequiName,
        qrImage: settings.qrImage,
      },
    };
  }

  async create(raffleId: string, dto: CreatePurchaseDto) {
    const raffle = await this.raffleRepo.findOne({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException('Rifa no encontrada');
    if (raffle.status !== RaffleStatus.OPEN) {
      throw new BadRequestException('Esta rifa no está abierta para compras');
    }

    const settings = await this.settingsService.getOrCreate();
    if (dto.quantity < settings.minQuantity) {
      throw new BadRequestException(
        `La compra mínima es de ${settings.minQuantity} números ($${(settings.minQuantity * TICKET_PRICE).toLocaleString('es-CO')} COP)`,
      );
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

  /**
   * [Público] El cliente consulta sus números usando correo + teléfono.
   * Busca en TODAS las rifas (no solo una), y solo en compras aprobadas (PAID),
   * ya que son las que realmente tienen números confirmados y enviados.
   */
  /**
   * [Público] Busca si un email ya tiene compras previas en cualquier rifa
   * y devuelve sus datos para autocompletar el formulario.
   */
  async lookupBuyer(email: string) {
    const purchase = await this.purchaseRepo.findOne({
      where: { buyerEmail: email.toLowerCase().trim() },
      order: { createdAt: 'DESC' },
    });

    if (!purchase) return { found: false };

    return {
      found: true,
      buyerName: purchase.buyerName,
      buyerPhone: purchase.buyerPhone,
      buyerCity: purchase.buyerCity,
    };
  }

  async checkMyNumbers(email: string, phone: string) {
    const normalizedPhone = phone.replace(/\s+/g, '').trim();

    const purchases = await this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.tickets', 'tickets')
      .leftJoinAndSelect('purchase.raffle', 'raffle')
      .where('LOWER(purchase.buyerEmail) = LOWER(:email)', { email: email.trim() })
      .andWhere('purchase.status = :status', { status: PaymentStatus.PAID })
      .getMany();

    const matched = purchases.filter(
      (p) => p.buyerPhone.replace(/\s+/g, '') === normalizedPhone,
    );

    if (matched.length === 0) {
      return { found: false, purchases: [] };
    }

    return {
      found: true,
      purchases: matched.map((p) => ({
        id: p.id,
        raffleId: p.raffleId,
        raffleTitle: p.raffle.title,
        raffleStatus: p.raffle.status,
        prize: p.raffle.prize,
        quantity: p.quantity,
        totalAmount: p.totalAmount,
        createdAt: p.createdAt,
        numbers: p.tickets.map((t) => ({ number: t.number, isBlessed: t.isBlessed })),
      })),
    };
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

  /**
   * [Admin] Top de compradores de una rifa, agrupados por correo del comprador.
   * Suma la cantidad de números (tickets) de TODAS sus compras sin importar el estado.
   */
  async getTopBuyers(raffleId: string, limit = 20) {
    const raffle = await this.raffleRepo.findOne({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException('Rifa no encontrada');

    const rows = await this.purchaseRepo
      .createQueryBuilder('purchase')
      .select('purchase.buyerEmail', 'buyerEmail')
      .addSelect('purchase.buyerName', 'buyerName')
      .addSelect('purchase.buyerPhone', 'buyerPhone')
      .addSelect('COUNT(purchase.id)', 'purchasesCount')
      .addSelect('SUM(purchase.quantity)', 'totalNumbers')
      .addSelect('SUM(purchase.totalAmount)', 'totalSpent')
      .where('purchase.raffleId = :raffleId', { raffleId })
      .groupBy('purchase.buyerEmail')
      .addGroupBy('purchase.buyerName')
      .addGroupBy('purchase.buyerPhone')
      .orderBy('totalNumbers', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r, index) => ({
      rank: index + 1,
      buyerName: r.buyerName,
      buyerEmail: r.buyerEmail,
      buyerPhone: r.buyerPhone,
      purchasesCount: Number(r.purchasesCount),
      totalNumbers: Number(r.totalNumbers),
      totalSpent: Number(r.totalSpent),
    }));
  }

  /**
   * [Admin] Busca a qué comprador pertenece un número específico dentro de una rifa.
   * Si el número no ha sido asignado a ninguna compra, retorna found: false.
   */
  async findTicketOwner(raffleId: string, number: string) {
    const raffle = await this.raffleRepo.findOne({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException('Rifa no encontrada');

    const ticket = await this.ticketRepo.findOne({
      where: { raffleId, number },
      relations: ['purchase'],
    });

    if (!ticket) {
      throw new NotFoundException(`El número ${number} no existe en esta rifa`);
    }

    if (!ticket.purchaseId || !ticket.purchase) {
      return {
        found: false,
        number: ticket.number,
        isBlessed: ticket.isBlessed,
        message: 'Este número aún no ha sido comprado por nadie',
      };
    }

    return {
      found: true,
      number: ticket.number,
      isBlessed: ticket.isBlessed,
      purchase: {
        id: ticket.purchase.id,
        status: ticket.purchase.status,
        buyerName: ticket.purchase.buyerName,
        buyerEmail: ticket.purchase.buyerEmail,
        buyerPhone: ticket.purchase.buyerPhone,
        buyerCity: ticket.purchase.buyerCity,
        quantity: ticket.purchase.quantity,
        totalAmount: ticket.purchase.totalAmount,
        createdAt: ticket.purchase.createdAt,
      },
    };
  }

  /**
   * [Admin] Top de compradores de una rifa filtrado por día.
   * Solo cuenta compras APROBADAS (PAID), agrupadas por comprador,
   * ordenadas de mayor a menor por total de números comprados ese día.
   */
  async getTopBuyersByDay(raffleId: string, date: string) {
    const raffle = await this.raffleRepo.findOne({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException('Rifa no encontrada');

    // Construir rango del día completo en timezone -05:00
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;

    const purchases = await this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.tickets', 'tickets')
      .where('purchase.raffleId = :raffleId', { raffleId })
      .andWhere('purchase.status = :status', { status: PaymentStatus.PAID })
      .andWhere('purchase.createdAt >= :start', { start: startOfDay })
      .andWhere('purchase.createdAt <= :end', { end: endOfDay })
      .orderBy('purchase.totalAmount', 'DESC')
      .getMany();

    if (purchases.length === 0) {
      return { date, total: 0, purchases: [] };
    }

    // Agrupar por comprador (email)
    const buyerMap = new Map<string, any>();
    for (const p of purchases) {
      const key = p.buyerEmail.toLowerCase();
      if (!buyerMap.has(key)) {
        buyerMap.set(key, {
          buyerName: p.buyerName,
          buyerEmail: p.buyerEmail,
          buyerPhone: p.buyerPhone,
          buyerCity: p.buyerCity,
          totalNumbers: 0,
          totalSpent: 0,
          numbers: [],
          purchases: [],
        });
      }
      const buyer = buyerMap.get(key);
      buyer.totalNumbers += p.quantity;
      buyer.totalSpent += Number(p.totalAmount);
      buyer.numbers.push(...p.tickets.map((t) => ({ number: t.number, isBlessed: t.isBlessed })));
      buyer.purchases.push({ id: p.id, quantity: p.quantity, totalAmount: p.totalAmount, createdAt: p.createdAt });
    }

    const ranked = Array.from(buyerMap.values())
      .sort((a, b) => b.totalNumbers - a.totalNumbers)
      .map((b, i) => ({ rank: i + 1, ...b }));

    const grandTotal = ranked.reduce((sum, b) => sum + b.totalSpent, 0);

    return { date, grandTotal, purchases: ranked };
  }
}