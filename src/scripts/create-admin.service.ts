import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateAdminService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.createAdminIfNotExists();
    }

    private async createAdminIfNotExists() {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminCedula = process.env.ADMIN_CEDULA;

        if (!adminEmail || !adminPassword || !adminCedula) {
            throw new Error('Las siguientes variables de entorno son requeridas: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_CEDULA');
        }

        const adminExists = await this.userRepository.findOne({
            where: { email: adminEmail }
        });

        if (!adminExists) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const admin = this.userRepository.create({
                email: adminEmail,
                password: hashedPassword,
                cedula: adminCedula,
                role: UserRole.ADMIN,
            });

            await this.userRepository.save(admin);
            console.log('✅ Usuario administrador creado exitosamente');
        } else {
            console.log('ℹ️ El usuario administrador ya existe');
        }
    }
}