import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Entrada } from '../../entities/entrada.entity';
import { IntentoFraude } from '../../entities/intento-fraude.entity';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ length: 10, unique: true })
    cedula: string;

    @Column({
        select: false,
        nullable: false
    })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Entrada, entrada => entrada.usuario)
    tickets: Entrada[];

    @OneToMany(() => IntentoFraude, intento => intento.usuario)
    intentosFraude: IntentoFraude[];
}