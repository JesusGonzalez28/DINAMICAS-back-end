export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendComprobantNotification(purchase: any, raffleTitle: string): Promise<void>;
    sendNumbersToClient(purchase: any, tickets: any[], raffleTitle: string, prize: string, blessedPrize: number): Promise<void>;
    sendRejectionToClient(purchase: any): Promise<void>;
}
