import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailerSend } from 'mailersend';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'MAILER_SEND',
            useFactory: (configService: ConfigService) => {
                const apiKey = configService.get('MAILERSEND_API_KEY');
                if (!apiKey) {
                    throw new Error('MAILERSEND_API_KEY is not defined in environment variables');
                }
                return new MailerSend({ apiKey });
            },
            inject: [ConfigService],
        },
        MailService,
    ],
    exports: [MailService],
})
export class MailModule { }