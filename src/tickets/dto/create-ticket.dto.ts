import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
    @ApiProperty({
        description: 'Nombre completo del cliente',
        example: 'Juan Pérez',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    nombre_cliente: string;

    @ApiProperty({
        description: 'Correo electrónico del cliente',
        example: 'juan.perez@example.com',
        required: true
    })
    @IsEmail()
    @IsNotEmpty()
    email_cliente: string;
}
