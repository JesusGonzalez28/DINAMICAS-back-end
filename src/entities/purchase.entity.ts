import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Raffle } from './raffle.entity';
import { Ticket } from './ticket.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',       // Compra creada, esperando comprobante
  REVIEW = 'REVIEW',         // Comprobante subido, esperando aprobación admin
  PAID = 'PAID',             // Admin aprobó, números enviados al cliente
  FAILED = 'FAILED',         // Admin rechazó o cancelado
}

@Entity('purchases')
export class Purchase {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column()
  buyerName!: string;

  @ApiProperty()
  @Column()
  buyerPhone!: string;

  @ApiProperty()
  @Column()
  buyerEmail!: string;

  @ApiProperty()
  @Column({ default: '' })
  buyerCity!: string;

  @ApiProperty()
  @Column()
  quantity!: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @ApiProperty({ enum: PaymentStatus })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  // Comprobante de pago subido por el cliente
  @Column({ nullable: true })
  voucherPath!: string;

  @Column({ nullable: true })
  paymentProvider!: string;

  @Column({ nullable: true })
  paymentId!: string;

  @Column({ type: 'json', nullable: true })
  paymentDetails!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true, type: 'timestamp' })
  confirmedAt!: Date | null;

  @Column()
  raffleId!: string;

  @ManyToOne(() => Raffle, (raffle) => raffle.purchases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raffleId' })
  raffle!: Raffle;

  @OneToMany(() => Ticket, (ticket) => ticket.purchase, { cascade: true })
  tickets!: Ticket[];
}
