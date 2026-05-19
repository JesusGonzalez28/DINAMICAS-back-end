import { Repository } from 'typeorm';
import { Raffle } from '../entities/raffle.entity';
import { Ticket } from '../entities/ticket.entity';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from './raffles.dto';
export declare class RafflesService {
    private raffleRepo;
    private ticketRepo;
    constructor(raffleRepo: Repository<Raffle>, ticketRepo: Repository<Ticket>);
    create(dto: CreateRaffleDto, prizeImagePath?: string): Promise<{
        message: string;
        raffle: Raffle;
        totalTickets: number;
        blessedNumbers: number;
    }>;
    update(id: string, dto: UpdateRaffleDto, prizeImagePath?: string): Promise<Raffle>;
    getActive(): Promise<Raffle>;
    findAll(): Promise<Raffle[]>;
    findOne(id: string): Promise<Raffle>;
    updateStatus(id: string, dto: UpdateRaffleStatusDto): Promise<Raffle>;
    getStats(id: string): Promise<{
        totalNumbers: number;
        sold: number;
        available: number;
        percentageSold: number;
        blessedSold: number;
    }>;
    getBlessedNumbers(id: string): Promise<{
        number: string;
        taken: boolean;
    }[]>;
    getSoldNumbers(id: string): Promise<{
        number: string;
        isBlessed: boolean;
    }[]>;
    getAvailableNumbers(id: string): Promise<{
        number: string;
        isBlessed: boolean;
    }[]>;
}
