import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly mailFrom: string;
    private readonly mailFromName: string;

    constructor(
        @Inject('MAILER_SEND') private readonly mailerSend: MailerSend,
        private readonly configService: ConfigService,
    ) {
        this.mailFrom = this.configService.get('MAIL_FROM')!;
        this.mailFromName = this.configService.get('MAIL_FROM_NAME')!;

        if (!this.mailFrom || !this.mailFromName) {
            throw new Error('MAIL_FROM and MAIL_FROM_NAME must be defined in environment variables');
        }
    }

    private async sendEmail(to: string, subject: string, html: string, text?: string, attachments?: any[]) {
        try {
            const sentFrom = new Sender(this.mailFrom, this.mailFromName);
            const recipients = [
                new Recipient(to)
            ];

            const emailParams = new EmailParams()
                .setFrom(sentFrom)
                .setTo(recipients)
                .setSubject(subject)
                .setHtml(html);

            if (text) {
                emailParams.setText(text);
            }

            // Add attachments if any
            if (attachments && attachments.length > 0) {
                emailParams.attachments = attachments;
            }

            const response = await this.mailerSend.email.send(emailParams);
            this.logger.log(`Email sent to ${to}: ${response.statusCode}`);
            return response;
        } catch (error) {
            this.logger.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }

    async sendUserConfirmation(email: string, token: string) {
        const url = `${this.configService.get('FRONTEND_URL')}/confirm-email?token=${token}`;
        const subject = 'Welcome to Our App! Confirm your Email';
        const html = `Hello,<br><br>Please confirm your email by clicking the following link:<br><br><a href="${url}">Confirm email</a>`;

        return this.sendEmail(email, subject, html);
    }

    async sendPasswordReset(email: string, token: string) {
        const url = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
        const subject = 'Password Reset Request';
        const html = `Hello,<br><br>To reset your password, please click the following link:<br><br><a href="${url}">Reset password</a>`;

        return this.sendEmail(email, subject, html);
    }

    async sendTicketConfirmation(
        email: string,
        name: string,
        ticketId: string,
        qrCodeUrl: string,
        eventDetails: any,
        nombre_evento: string,
        amount: number,
        purchaseDate: Date
    ) {
        try {
            const templatePath = path.join(
                __dirname,
                'templates',
                'ticket-confirmation.hbs'
            );
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            const template = handlebars.compile(templateSource);
            const formattedDate = purchaseDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Generate a unique content ID for the QR code
            const qrContentId = `qr-${ticketId}`;

            // Extract base64 data from the data URL
            const base64Data = qrCodeUrl.split(',')[1];
            this.logger.log("eventDetails", eventDetails)
            const html = template({
                name,
                ticketId,
                qrContentId,  // Pass the content ID to the template
                eventDetails,
                nombre_evento: nombre_evento,
                amount: amount.toFixed(2),
                purchaseDate: formattedDate,
                supportEmail: this.configService.get('MAIL_SUPPORT_EMAIL') || 'soporte@tudominio.com'
            });

            // Create the email with embedded image using MailerSend's API
            const sentFrom = new Sender(this.mailFrom, this.mailFromName);
            const recipients = [new Recipient(email)];

            const emailParams = new EmailParams()
                .setFrom(sentFrom)
                .setTo(recipients)
                .setSubject(`Confirmación de Compra - Ticket #${ticketId}`)
                .setHtml(html)
                .setAttachments([{
                    content: base64Data,
                    filename: `ticket-${ticketId}.png`,
                    id: qrContentId,
                    disposition: 'inline'
                }]);

            const response = await this.mailerSend.email.send(emailParams);
            this.logger.log(`Email sent to ${email}: ${response.statusCode}`);
            return response;
        } catch (error) {
            this.logger.error(`Error generating ticket confirmation email: ${error.message}`, error.stack);
            throw error;
        }
    }
}