import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from './ticket.entity';
import { Purchase } from './purchase.entity';

export enum RaffleStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAWN = 'DRAWN',
}

@Entity('raffles')
export class Raffle {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column() title!: string;
  @ApiProperty() @Column({ type: 'text', nullable: true }) description!: string;
  @ApiProperty() @Column() prize!: string;
  @ApiProperty() @Column({ type: 'varchar', nullable: true }) prizeImage!: string | null;
  @ApiProperty() @Column({ type: 'decimal', precision: 12, scale: 2, default: 400 }) pricePerNumber!: number;
  @ApiProperty() @Column({ type: 'json', nullable: true }) packages!: { quantity: number; label: string }[] | null;
  @ApiProperty() @Column({ default: 10 }) blessedCount!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 12, scale: 2, default: 50000 }) blessedPrize!: number;
  @ApiProperty() @Column({ type: 'timestamp', nullable: true }) drawDate!: Date | null;
  @ApiProperty() @Column({ default: 10000 }) totalNumbers!: number;
  @ApiProperty({ enum: RaffleStatus }) @Column({ type: 'enum', enum: RaffleStatus, default: RaffleStatus.OPEN }) status!: RaffleStatus;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
  @OneToMany(() => Ticket, (ticket) => ticket.raffle) tickets!: Ticket[];
  @OneToMany(() => Purchase, (purchase) => purchase.raffle) purchases!: Purchase[];
}
