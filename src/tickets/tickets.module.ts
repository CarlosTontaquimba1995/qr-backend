import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Entrada } from '../entities/entrada.entity';
import { IntentoFraude } from '../entities/intento-fraude.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entrada, IntentoFraude, User]),
    AuthModule,
    MailModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule { }