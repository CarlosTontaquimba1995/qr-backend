import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { ValidateTicketRequestDto } from './dto/validate-ticket-request.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { MailService } from '../mail/mail.service';
import { Entrada, EstadoEntradaEnum } from 'src/entities/entrada.entity';
import { IntentoFraude, MotivoError } from 'src/entities/intento-fraude.entity';
import { Logger } from '@nestjs/common';


@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  constructor(
    @InjectRepository(Entrada)
    private readonly entradaRepository: Repository<Entrada>,
    @InjectRepository(IntentoFraude)
    private readonly intentoFraudeRepository: Repository<IntentoFraude>,
    private dataSource: DataSource,
    private readonly mailService: MailService,
  ) { }

  async createTicket(createTicketDto: CreateTicketDto, userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const token = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;

    const ticket = this.entradaRepository.create({
      uuid_ticket: token,
      nombre_cliente: createTicketDto.nombre_cliente,
      nombre_evento: createTicketDto.nombre_evento,
      email_cliente: createTicketDto.email_cliente,
      monto_total: createTicketDto.monto_total,
      detalles: createTicketDto.detalles,
      estado: EstadoEntradaEnum.PENDIENTE,
      fecha_compra: new Date(),
      usuario_id: userId
    });

    await this.entradaRepository.save(ticket);
    const qrCodeUrl = await this.generateQRCode(token);

    try {
      await this.mailService.sendTicketConfirmation(
        ticket.email_cliente,
        ticket.nombre_cliente,
        ticket.uuid_ticket,
        qrCodeUrl,
        ticket.detalles,
        ticket.nombre_evento,
        ticket.monto_total,
        ticket.fecha_compra
      );
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return {
      ticket: {
        id: ticket.id,
        token: ticket.uuid_ticket,
        detalles: ticket.detalles,
        nombre_cliente: ticket.nombre_cliente,
        nombre_evento: ticket.nombre_evento,
        email_cliente: ticket.email_cliente,
        monto_total: ticket.monto_total,
        estado: ticket.estado,
        fecha_compra: ticket.fecha_compra
      },
      qrCodeUrl
    };
  }

  private async generateQRCode(content: string): Promise<string> {
    try {
      return await QRCode.toDataURL(content);
    } catch (error) {
      throw new Error('Error generating QR code');
    }
  }

  async validateTicket(validateRequest: ValidateTicketRequestDto) {
    const { token_escaneado, id_puerta, usuario_id, usuario_rol } = validateRequest;

    if (!usuario_id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (usuario_rol !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden validar tickets');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const ticket = await queryRunner.manager
        .createQueryBuilder(Entrada, 'entrada')
        .setLock('pessimistic_write')
        .where('entrada.uuid_ticket = :uuid', { uuid: token_escaneado })
        .getOne();

      if (!ticket) {
        await this.registrarIntentoFraude(
          queryRunner,
          token_escaneado,
          id_puerta,
          MotivoError.TOKEN_INEXISTENTE,
          usuario_id
        );

        return {
          success: false,
          error: 'Ticket no encontrado',
          codigo: 'TICKET_NO_ENCONTRADO'
        };
      }

      if (ticket.estado === EstadoEntradaEnum.USADO) {
        await this.registrarIntentoFraude(
          queryRunner,
          token_escaneado,
          id_puerta,
          MotivoError.YA_USADO,
          usuario_id
        );

        return {
          success: false,
          error: 'Este ticket ya ha sido utilizado',
          codigo: 'TICKET_YA_USADO',
          fecha_uso: ticket.fecha_uso
        };
      }

      ticket.estado = EstadoEntradaEnum.USADO;
      ticket.fecha_uso = new Date();

      await queryRunner.manager.save(ticket);
      await queryRunner.commitTransaction();

      return {
        success: true,
        nombre_cliente: ticket.nombre_cliente,
        mensaje: 'Entrada validada exitosamente',
        fecha_uso: ticket.fecha_uso
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      console.error('Error al validar ticket:', error);

      return {
        success: false,
        error: 'Error interno del servidor al validar el ticket',
        codigo: 'ERROR_INTERNO'
      };
    } finally {
      await queryRunner.release();
    }
  }

  private async registrarIntentoFraude(
    queryRunner: any,
    uuid: string,
    idPuerta: string,
    motivo: MotivoError,
    usuarioId: string
  ) {
    try {
      if (!queryRunner.isConnected) {
        await queryRunner.connect();
      }

      if (!queryRunner.isTransactionActive) {
        await queryRunner.startTransaction();
      }

      const intento = new IntentoFraude();
      intento.uuid_escaneado = uuid;
      intento.id_puerta = idPuerta;
      intento.motivo_error = motivo;
      intento.fecha_intento = new Date();
      intento.usuario_id = usuarioId;

      await this.intentoFraudeRepository.save(intento);

      if (queryRunner.isTransactionActive) {
        await queryRunner.commitTransaction();
      }

      return true;
    } catch (error) {
      console.error('Error al registrar intento de fraude:', error);
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      return false;
    } finally {
    }
  }
}
