import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { Entrada } from './entities/entrada.entity';
import { IntentoFraude } from './entities/intento-fraude.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
       host: configService.get('DB_HOST'),
       port: configService.get<number>('DB_PORT'),
       username: configService.get('DB_USERNAME'),
       password: configService.get('DB_PASSWORD'),
       database: configService.get('DB_DATABASE'),
       entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        ssl: configService.get<boolean>('DB_SSL', false) ? {
          rejectUnauthorized: false
        } : undefined,
      }),
      inject: [ConfigService]
    }),

    AuthModule,
    UsersModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
