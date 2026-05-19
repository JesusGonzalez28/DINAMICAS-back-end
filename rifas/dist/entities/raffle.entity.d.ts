import { Ticket } from './ticket.entity';
import { Purchase } from './purchase.entity';
export declare enum RaffleStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    DRAWN = "DRAWN"
}
export declare class Raffle {
    id: string;
    title: string;
    description: string;
    prize: string;
    prizeImage: string | null;
    pricePerNumber: number;
    packages: {
        quantity: number;
        label: string;
    }[] | null;
    blessedCount: number;
    blessedPrize: number;
    drawDate: Date | null;
    totalNumbers: number;
    status: RaffleStatus;
    createdAt: Date;
    updatedAt: Date;
    tickets: Ticket[];
    purchases: Purchase[];
}
