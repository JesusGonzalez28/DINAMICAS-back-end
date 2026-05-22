import { Raffle } from './raffle.entity';
import { Purchase } from './purchase.entity';
export declare class Ticket {
    id: string;
    number: string;
    raffleId: string;
    purchaseId: string | null;
    isBlessed: boolean;
    assignedAt: Date;
    raffle: Raffle;
    purchase: Purchase | null;
}
