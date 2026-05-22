import { PaymentStatus } from '../entities/purchase.entity';
export declare const TICKET_PRICE = 400;
export declare const MIN_TICKETS = 25;
export declare const PACKAGES: {
    quantity: number;
    total: number;
    label: string;
}[];
export declare class CreatePurchaseDto {
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    buyerCity: string;
    quantity: number;
}
export declare class ConfirmPaymentDto {
    paymentProvider: string;
    paymentId: string;
    paymentDetails?: any;
}
export declare class UpdatePurchaseStatusDto {
    status: PaymentStatus;
}
