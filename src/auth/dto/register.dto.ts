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
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 100, { message: 'Los apellidos deben tener entre 2 y 100 caracteres' })
    lastName: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}