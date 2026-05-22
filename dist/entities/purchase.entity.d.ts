import { Raffle } from './raffle.entity';
import { Ticket } from './ticket.entity';
export declare enum PaymentStatus {
    PENDING = "PENDING",
    REVIEW = "REVIEW",
    PAID = "PAID",
    FAILED = "FAILED"
}
export declare class Purchase {
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
}
