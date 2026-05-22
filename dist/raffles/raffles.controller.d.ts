import { RafflesService } from './raffles.service';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from './raffles.dto';
export declare class RafflesController {
    private readonly rafflesService;
    constructor(rafflesService: RafflesService);
    findAll(): Promise<import("../entities/raffle.entity").Raffle[]>;
    getActive(): Promise<import("../entities/raffle.entity").Raffle>;
    findOne(id: string): Promise<import("../entities/raffle.entity").Raffle>;
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
    create(dto: CreateRaffleDto, file?: Express.Multer.File): Promise<{
        message: string;
        raffle: import("../entities/raffle.entity").Raffle;
        totalTickets: number;
        blessedNumbers: number;
    }>;
    update(id: string, dto: UpdateRaffleDto, file?: Express.Multer.File): Promise<import("../entities/raffle.entity").Raffle>;
    updateStatus(id: string, dto: UpdateRaffleStatusDto): Promise<import("../entities/raffle.entity").Raffle>;
}
