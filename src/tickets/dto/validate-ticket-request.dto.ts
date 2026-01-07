import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateTicketRequestDto {
    @ApiProperty({
        description: 'Token único del ticket escaneado',
        example: 'TKT-13ED0090',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    token_escaneado: string;

    @ApiProperty({
        description: 'Identificador único de la puerta donde se está validando',
        example: 'puerta-principal-1',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    id_puerta: string;

    @ApiProperty({
        description: 'ID del usuario que realiza la validación',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    @IsUUID()
    @IsOptional()
    usuario_id?: string;

    @ApiProperty({
        description: 'Rol del usuario que realiza la validación',
        example: 'ADMIN',
        required: false
    })
    @IsString()
    @IsOptional()
    usuario_rol?: string;
}
