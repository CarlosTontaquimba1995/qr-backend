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

    @Column({ name: 'first_name', length: 100, nullable: false })
    firstName: string;

    @Column({ name: 'last_name', length: 100, nullable: false })
    lastName: string;

    @Column({
        select: false,
        nullable: false
    })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        enumName: 'user_role',
        default: UserRole.USER
    })
    role: UserRole;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Entrada, entrada => entrada.usuario)
    tickets: Entrada[];

    @OneToMany(() => IntentoFraude, intento => intento.usuario)
    intentosFraude: IntentoFraude[];
}