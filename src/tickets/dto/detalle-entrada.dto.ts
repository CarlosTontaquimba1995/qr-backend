import { IsEmail, IsNotEmpty, IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DetalleEntradaDto {
    @ApiProperty({ example: 'vip' })
    @IsString()
    type: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 100 })
    @IsNumber()
    price: number;

    @ApiProperty({ example: 100 })
    @IsNumber()
    total: number;
}

export class CreateTicketDto {
    @ApiProperty({ description: 'Nombre completo del cliente', example: 'Juan Pérez' })
    @IsString()
    @IsNotEmpty()
    nombre_cliente: string;

    @ApiProperty({ description: 'Correo electrónico del cliente', example: 'juan.perez@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email_cliente: string;

    @ApiProperty({
        description: 'Lista de entradas compradas',
        type: [DetalleEntradaDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleEntradaDto)
    detalles: DetalleEntradaDto[];
}