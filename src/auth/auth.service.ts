import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        try {
            console.log(`Validating user with email: ${email}`);

            const user = await this.usersRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .where('user.email = :email', { email })
                .getOne();

            console.log('User from DB:', JSON.stringify(user, null, 2));

            if (!user) {
                console.log('User not found in database');
                return null;
            }

            if (!user.password) {
                console.log('No password set for user');
                return null;
            }

            console.log('Comparing provided password with hash...');
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log(`Password comparison result for ${email}:`, isPasswordValid);

            if (!isPasswordValid) {
                console.log('Invalid password for user:', email);
                return null;
            }

            const { password: _, ...result } = user;
            return result;
        } catch (error) {
            console.error('Error validating user:', error);
            return null;
        }
    }

    async login(loginDto: LoginDto) {
        console.log('Login attempt for:', loginDto.email);

        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            console.log('Login failed - invalid credentials for:', loginDto.email);
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log('Creating JWT payload for user:', user.id);
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        };

        try {
            const token = this.jwtService.sign(payload);
            console.log('JWT token generated successfully');

            return {
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
            };
        } catch (error) {
            console.error('Error generating JWT token:', error);
            throw new UnauthorizedException('Could not create access token');
        }
    }

    async register(registerDto: RegisterDto) {
        try {
            const existingUser = await this.usersRepository.findOne({
                where: { email: registerDto.email }
            });

            if (existingUser) {
                throw new ConflictException('Email already in use');
            }

            const existingCedula = await this.usersRepository.findOne({
                where: { cedula: registerDto.cedula }
            });

            if (existingCedula) {
                throw new ConflictException('Cedula already in use');
            }

            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const newUser = this.usersRepository.create({
                ...registerDto,
                password: hashedPassword,
            });

            const savedUser = await this.usersRepository.save(newUser);
            const { password, ...result } = savedUser;
            return result;
        } catch (error) {
            console.error('Error registering user:', error);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new ConflictException('Error creating user');
        }
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }
}
