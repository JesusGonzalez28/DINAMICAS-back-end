import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsNumber, IsPositive,
  IsDateString, IsOptional, IsEnum, IsArray,
  ValidateNested, Min,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { RaffleStatus } from '../entities/raffle.entity';

export class PackageDto {
  @ApiProperty({ example: 25 }) @IsNumber() @Min(1) quantity!: number;
  @ApiProperty({ example: 'Paquete Básico' }) @IsString() @IsNotEmpty() label!: string;
}

export class CreateRaffleDto {
  @ApiProperty() @IsString() @IsNotEmpty() title!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty() @IsString() @IsNotEmpty() prize!: string;

  @ApiProperty({ example: 400 })
  @Transform(({ value }) => Number(value))
  @IsNumber() @IsPositive()
  pricePerNumber!: number;

  @ApiPropertyOptional()
  @IsDateString() @IsOptional()
  drawDate?: string;

  @ApiPropertyOptional({ type: [PackageDto] })
  @IsOptional()
  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try { parsed = JSON.parse(value); } catch { return value; }
    }
    if (!Array.isArray(parsed)) return parsed;
    return parsed.map((item) => plainToInstance(PackageDto, item));
  })
  @IsArray() @ValidateNested({ each: true }) @Type(() => PackageDto)
  packages?: PackageDto[];

  @ApiPropertyOptional({ example: 10 })
  @Transform(({ value }) => Number(value))
  @IsNumber() @Min(0) @IsOptional()
  blessedCount?: number;

  @ApiPropertyOptional({ example: 50000 })
  @Transform(({ value }) => Number(value))
  @IsNumber() @IsPositive() @IsOptional()
  blessedPrize?: number;
}

export class UpdateRaffleDto {
  @ApiPropertyOptional() @IsString() @IsOptional() title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() prize?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value ? Number(value) : value)
  @IsNumber() @IsPositive() @IsOptional()
  pricePerNumber?: number;

  @ApiPropertyOptional() @IsDateString() @IsOptional() drawDate?: string;

  @ApiPropertyOptional({ type: [PackageDto] })
  @IsOptional()
  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try { parsed = JSON.parse(value); } catch { return value; }
    }
    if (!Array.isArray(parsed)) return parsed;
    return parsed.map((item) => plainToInstance(PackageDto, item));
  })
  @IsArray() @ValidateNested({ each: true }) @Type(() => PackageDto)
  packages?: PackageDto[];

  @ApiPropertyOptional()
  @Transform(({ value }) => value ? Number(value) : value)
  @IsNumber() @Min(0) @IsOptional()
  blessedCount?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value ? Number(value) : value)
  @IsNumber() @IsPositive() @IsOptional()
  blessedPrize?: number;
}

export class UpdateRaffleStatusDto {
  @ApiProperty({ enum: RaffleStatus }) @IsEnum(RaffleStatus) status!: RaffleStatus;
}