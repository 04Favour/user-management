/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer"; // Use import * as
import { SendMailOptions, Transporter } from "nodemailer"; // Import Transporter and SendMailOptions
import { sendEmailDto } from "./dto/email.dto";

@Injectable()
export class EmailService {
    private transporter: Transporter;

    constructor() {
      
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendEmail(dto: sendEmailDto): Promise<void> {
        const { recipients, subject, html } = dto;


        const mailOptions: SendMailOptions = { 
            from: process.env.EMAIL_USER,
            to: recipients,
            subject: subject,
            html: html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions); 
            console.log('Message sent: %s', info.messageId);
        } catch(error) {
            console.error('Error sending mail: ', error);
            
        }
    }
}