import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../entities/purchase.entity';

export const TICKET_PRICE = 400;
export const MIN_TICKETS = 25;
export const PACKAGES = [
  { quantity: 25,  total: 25  * TICKET_PRICE, label: 'Paquete Básico' },
  { quantity: 50,  total: 50  * TICKET_PRICE, label: 'Paquete Bronce' },
  { quantity: 75,  total: 75  * TICKET_PRICE, label: 'Paquete Plata' },
  { quantity: 100, total: 100 * TICKET_PRICE, label: 'Paquete Oro' },
  { quantity: 200, total: 200 * TICKET_PRICE, label: 'Paquete Diamante' },
];

export class CreatePurchaseDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  buyerName!: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  buyerPhone!: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'Email inválido' })
  buyerEmail!: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  buyerCity!: string;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(MIN_TICKETS, { message: `La compra mínima es de ${MIN_TICKETS} números ($${MIN_TICKETS * TICKET_PRICE} COP)` })
  quantity!: number;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'wompi' })
  @IsString()
  @IsNotEmpty()
  paymentProvider!: string;

  @ApiProperty({ example: 'pay_abc123' })
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  paymentDetails?: any;
}

export class UpdatePurchaseStatusDto {
  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;
}

export class CheckMyNumbersDto {
  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  phone!: string;
}
