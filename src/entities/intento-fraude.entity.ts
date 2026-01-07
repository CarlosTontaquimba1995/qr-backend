import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';

export enum MotivoError {
  YA_USADO = 'YA_USADO',
  TOKEN_INEXISTENTE = 'TOKEN_INEXISTENTE'
}

@Entity('intentos_fraude')
export class IntentoFraude {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  uuid_escaneado: string;

  @Column({
    type: 'enum',
    enum: MotivoError,
    nullable: false
  })
  motivo_error: MotivoError;

  @Column({ type: 'varchar', length: 50, nullable: true })
  id_puerta: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_intento: Date;

  @Column({ type: 'uuid', nullable: true })
  usuario_id: string;

  @ManyToOne(() => User, user => user.intentosFraude)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}
