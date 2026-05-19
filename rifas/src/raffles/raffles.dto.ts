import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsDateString, IsOptional, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RaffleStatus } from '../entities/raffle.entity';

export class PackageDto {
  @ApiProperty({ example: 25 }) @IsNumber() @Min(1) quantity!: number;
  @ApiProperty({ example: 'Paquete Básico' }) @IsString() @IsNotEmpty() label!: string;
}

export class CreateRaffleDto {
  @ApiProperty() @IsString() @IsNotEmpty() title!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty() @IsString() @IsNotEmpty() prize!: string;
  @ApiProperty({ example: 400 }) @Type(() => Number) @IsNumber() @IsPositive() pricePerNumber!: number;
  @ApiPropertyOptional({ description: 'Fecha del sorteo (opcional)' }) @IsDateString() @IsOptional() drawDate?: string;
  @ApiPropertyOptional({ type: [PackageDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => PackageDto) @IsOptional() packages?: PackageDto[];
  @ApiPropertyOptional({ example: 10 }) @Type(() => Number) @IsNumber() @Min(0) @IsOptional() blessedCount?: number;
  @ApiPropertyOptional({ example: 50000 }) @Type(() => Number) @IsNumber() @IsPositive() @IsOptional() blessedPrize?: number;
}

export class UpdateRaffleDto {
  @ApiPropertyOptional() @IsString() @IsOptional() title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() prize?: string;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsPositive() @IsOptional() pricePerNumber?: number;
  @ApiPropertyOptional() @IsDateString() @IsOptional() drawDate?: string;
  @ApiPropertyOptional({ type: [PackageDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => PackageDto) @IsOptional() packages?: PackageDto[];
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @Min(0) @IsOptional() blessedCount?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsPositive() @IsOptional() blessedPrize?: number;
}

export class UpdateRaffleStatusDto {
  @ApiProperty({ enum: RaffleStatus }) @IsEnum(RaffleStatus) status!: RaffleStatus;
}
