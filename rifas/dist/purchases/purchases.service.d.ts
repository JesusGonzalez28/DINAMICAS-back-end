import { Repository, DataSource } from 'typeorm';
import { Purchase, PaymentStatus } from '../entities/purchase.entity';
import { Ticket } from '../entities/ticket.entity';
import { Raffle } from '../entities/raffle.entity';
import { CreatePurchaseDto } from './purchases.dto';
import { MailService } from '../mail/mail.service';
export declare class PurchasesService {
    private purchaseRepo;
    private ticketRepo;
    private raffleRepo;
    private dataSource;
    private mailService;
    constructor(purchaseRepo: Repository<Purchase>, ticketRepo: Repository<Ticket>, raffleRepo: Repository<Raffle>, dataSource: DataSource, mailService: MailService);
    getPackages(): {
        pricePerNumber: number;
        minimumPurchase: number;
        minimumTotal: number;
        packages: {
            quantity: number;
            total: number;
            label: string;
        }[];
        payment: {
            method: string;
            number: string;
            name: string;
        };
    };
    create(raffleId: string, dto: CreatePurchaseDto): Promise<{
        message: string;
        purchase: Purchase;
        quantity: number;
        pricePerNumber: number;
        totalAmount: number;
        totalFormatted: string;
        payment: {
            method: string;
            number: string;
            name: string;
        };
    }>;
    uploadVoucher(purchaseId: string, filePath: string): Promise<{
        message: string;
        purchaseId: string;
        status: PaymentStatus;
    }>;
    searchPurchases(query: string): Promise<{
        id: string;
        raffleId: string;
        raffleName: string;
        buyerName: string;
        buyerEmail: string;
        buyerPhone: string;
        buyerCity: string;
        quantity: number;
        totalAmount: string;
        status: PaymentStatus;
        voucherPath: string | null;
        hasBlessedNumber: boolean;
        blessedNumbers: number[];
        numbers: number[];
        createdAt: Date;
    }[]>;
    approvePurchase(purchaseId: string): Promise<{
        message: string;
        purchase: Purchase;
        tickets: Ticket[];
    }>;
    rejectPurchase(purchaseId: string): Promise<{
        message: string;
    }>;
    findByRaffle(raffleId: string): Promise<{
        hasBlessedNumber: boolean;
        blessedNumbers: number;
        id: string;
        buyerName: string;
        buyerPhone: string;
        buyerEmail: string;
        buyerCity: string;
        quantity: number;
        totalAmount: number;
        status: PaymentStatus;
        voucherPath: string;
        paymentProvider: string;
        paymentId: string;
        paymentDetails: any;
        createdAt: Date;
        confirmedAt: Date | null;
        raffleId: string;
        raffle: Raffle;
        tickets: Ticket[];
    }[]>;
    findOne(id: string): Promise<Purchase>;
    cancelPurchase(purchaseId: string): Promise<Purchase>;
    getTopBuyers(raffleId: string): Promise<any[]>;
}
