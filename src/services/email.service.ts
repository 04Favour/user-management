/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { sendEmailDto } from "./dto/email.dto";
import { Resend } from "resend";

@Injectable()
export class EmailService {
    private resend: Resend

    constructor() {
      
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendEmail(dto: sendEmailDto): Promise<boolean> {
        const { recipients, subject, html } = dto;
        try {
            const response = await this.resend.emails.send({
                from: process.env.EMAIL_USER!, 
                to: recipients,
                subject: subject,
                html: html,
            });

            console.log('Message sent via Resend. ID: %s', response.data?.id);
            return true;
        } catch(error: any) {
            console.error('Error sending mail via Resend: ', error);
            return false;
        }
    }
}