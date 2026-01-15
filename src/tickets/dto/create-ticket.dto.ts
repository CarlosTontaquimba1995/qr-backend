import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DetalleEntradaDto } from './detalle-entrada.dto';
import { Type } from 'class-transformer';

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

    @ApiProperty({
        description: 'Nombre del evento',
        example: 'Concierto de...',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    nombre_evento: string;

    @ApiProperty({ example: 300 })
    @IsNumber()
    @IsNotEmpty()
    monto_total: number;

    @ApiProperty({
        description: 'Lista de entradas compradas',
        type: [DetalleEntradaDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleEntradaDto)
    detalles: DetalleEntradaDto[];
}
