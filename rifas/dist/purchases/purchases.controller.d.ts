import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './purchases.dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
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
        purchase: import("../entities/purchase.entity").Purchase;
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
    uploadVoucher(purchaseId: string, file: Express.Multer.File): Promise<{
        message: string;
        purchaseId: string;
        status: import("../entities/purchase.entity").PaymentStatus;
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
        status: import("../entities/purchase.entity").PaymentStatus;
        voucherPath: string | null;
        hasBlessedNumber: boolean;
        blessedNumbers: number[];
        numbers: number[];
        createdAt: Date;
    }[]>;
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
        status: import("../entities/purchase.entity").PaymentStatus;
        voucherPath: string;
        paymentProvider: string;
        paymentId: string;
        paymentDetails: any;
        createdAt: Date;
        confirmedAt: Date | null;
        raffleId: string;
        raffle: import("../entities/raffle.entity").Raffle;
        tickets: import("../entities/ticket.entity").Ticket[];
    }[]>;
    topBuyers(raffleId: string): Promise<any[]>;
    findOne(purchaseId: string): Promise<import("../entities/purchase.entity").Purchase>;
    approve(purchaseId: string): Promise<{
        message: string;
        purchase: import("../entities/purchase.entity").Purchase;
        tickets: import("../entities/ticket.entity").Ticket[];
    }>;
    reject(purchaseId: string): Promise<{
        message: string;
    }>;
    cancel(purchaseId: string): Promise<import("../entities/purchase.entity").Purchase>;
}
