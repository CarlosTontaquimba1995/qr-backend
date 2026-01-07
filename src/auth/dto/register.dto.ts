import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsEnum, Length, Matches } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Length(10, 10, { message: 'La cédula debe tener exactamente 10 dígitos' })
    @Matches(/^[0-9]+$/, { message: 'La cédula solo puede contener números' })
    @IsNotEmpty()
    cedula: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}