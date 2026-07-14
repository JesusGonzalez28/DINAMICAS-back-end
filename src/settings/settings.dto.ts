import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: '3126324715' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nequiNumber?: string;

  @ApiPropertyOptional({ example: 'Jesus David Gonzalez Tapias' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nequiName?: string;

  @ApiPropertyOptional({ example: 25, description: 'Cantidad mínima de números que un cliente puede comprar' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La cantidad mínima debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima debe ser al menos 1' })
  minQuantity?: number;
}
