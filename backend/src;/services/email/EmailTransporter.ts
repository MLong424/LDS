// src/services/email/EmailTransporter.ts
import nodemailer, { Transporter } from 'nodemailer';

export class EmailTransporter {
    private static instance: EmailTransporter;
    private transporter!: Transporter;
    
    private constructor() {
        this.initTransporter();
    }

    public static getInstance(): EmailTransporter {
        if (!EmailTransporter.instance) {
            EmailTransporter.instance = new EmailTransporter();
        }
        return EmailTransporter.instance;
    }

    public static resetInstance(): void {
        if (EmailTransporter.instance && EmailTransporter.instance.transporter) {
            EmailTransporter.instance.transporter.close();
            EmailTransporter.instance = null as any;
        }
    }

    private initTransporter(): void {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });
        }
    }

    public async verifyTransporter(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('Email transporter verification failed:', error);
            return false;
        }
    }

    public async sendMail(mailOptions: any): Promise<void> {
        await this.transporter.sendMail(mailOptions);
    }

    public close(): void {
        if (this.transporter) {
            this.transporter.close();
        }
    }
}