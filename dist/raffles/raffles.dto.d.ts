import { RaffleStatus } from '../entities/raffle.entity';
export declare class PackageDto {
    quantity: number;
    label: string;
}
export declare class CreateRaffleDto {
    title: string;
    description?: string;
    prize: string;
    pricePerNumber: number;
    drawDate?: string;
    packages?: PackageDto[];
    blessedCount?: number;
    blessedPrize?: number;
}
export declare class UpdateRaffleDto {
    title?: string;
    description?: string;
    prize?: string;
    pricePerNumber?: number;
    drawDate?: string;
    packages?: PackageDto[];
    blessedCount?: number;
    blessedPrize?: number;
}
export declare class UpdateRaffleStatusDto {
    status: RaffleStatus;
}
