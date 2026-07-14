import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Tabla de configuración general de la app (fila única, id fijo 'general').
 * Permite que el admin cambie datos de pago Nequi y el QR sin tocar código ni redeploy.
 */
@Entity('settings')
export class Settings {
  @ApiProperty()
  @PrimaryColumn({ default: 'general' })
  id!: string;

  @ApiProperty()
  @Column({ default: '3126324715' })
  nequiNumber!: string;

  @ApiProperty()
  @Column({ default: 'Jesus David Gonzalez Tapias' })
  nequiName!: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  qrImage!: string | null;

  @ApiProperty()
  @Column({ type: 'int', default: 25 })
  minQuantity!: number;

  @ApiProperty()
  @Column({ default: '677-678822.78' })
  bancolombiaAccount!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
