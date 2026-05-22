import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Raffle } from './raffle.entity';
import { Purchase } from './purchase.entity';

@Entity('tickets')
@Index(['raffleId', 'number'], { unique: true })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 4 })
  number!: string;

  @Column()
  raffleId!: string;

  @Column({ nullable: true })
  purchaseId!: string | null;

  // Número bendecido: vale $50.000 extra
  @Column({ default: false })
  isBlessed!: boolean;

  @CreateDateColumn()
  assignedAt!: Date;

  @ManyToOne(() => Raffle, (raffle) => raffle.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raffleId' })
  raffle!: Raffle;

  @ManyToOne(() => Purchase, (purchase) => purchase.tickets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'purchaseId' })
  purchase!: Purchase | null;
}
