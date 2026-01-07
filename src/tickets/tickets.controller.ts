import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TicketsService } from './tickets.service';
import { ValidateTicketRequestDto } from './dto/validate-ticket-request.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post('generar')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo ticket QR' })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({
    status: 201,
    description: 'Ticket creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        ticket: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            token: { type: 'string' },
            nombre_cliente: { type: 'string' },
            email_cliente: { type: 'string' },
            estado: { type: 'string', enum: ['PENDIENTE', 'USADO'] },
            fecha_compra: { type: 'string', format: 'date-time' },
            usuario_id: { type: 'string', format: 'uuid' }
          }
        },
        qrCodeUrl: { type: 'string', description: 'URL de datos del código QR en formato base64' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para realizar esta acción' })
  async create(
    @CurrentUser() user: CurrentUserInterface,
    @Body() createTicketDto: CreateTicketDto
  ) {
    return this.ticketsService.createTicket(createTicketDto, user.id);
  }

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar un ticket QR' })
  @ApiResponse({ status: 200, description: 'Ticket validado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para validar tickets' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  @ApiResponse({ status: 409, description: 'Ticket ya ha sido utilizado' })
  async validateTicket(
    @CurrentUser() user: CurrentUserInterface,
    @Body() validateTicketDto: ValidateTicketRequestDto
  ) {
    const validateRequest: ValidateTicketRequestDto = {
      ...validateTicketDto,
      usuario_id: user.id,
      usuario_rol: user.role
    };
    return this.ticketsService.validateTicket(validateRequest);
  }
}
