import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';

export type EstadoEntrada = 'PENDIENTE' | 'USADO';

export const EstadoEntradaEnum = {
  PENDIENTE: 'PENDIENTE' as EstadoEntrada,
  USADO: 'USADO' as EstadoEntrada
};

@Entity('entrada')
export class Entrada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid_ticket: string;

  @Column({ type: 'varchar', length: 100 })
  nombre_cliente: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email_cliente: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_total: number;

  @Column({
    type: 'varchar',
    default: 'PENDIENTE'
  })
  estado: EstadoEntrada;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_compra: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_uso: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, user => user.tickets)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'jsonb' })
  detalles: any;
}