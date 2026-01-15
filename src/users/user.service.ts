import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async update(id: string, updateData: Partial<User>): Promise<User | null> {
        await this.usersRepository.update(id, updateData);
        const updatedUser = await this.usersRepository.findOne({ where: { id } });
        if (!updatedUser) {
            throw new Error(`User with ID ${id} not found after update`);
        }
        return updatedUser;
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
            select: ['id', 'email', 'role', 'firstName', 'lastName', 'created_at', 'updated_at']
        });
    }
}
