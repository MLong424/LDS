// src/services/email/EmailService.ts
import { IEmailService } from '../interfaces/IEmailService';
import { OrderDetail } from '../../models/entity/Order';
import { OrderEmailService } from './OrderEmailService';
import { AuthEmailService } from './AuthEmailService';
import { EmailTransporter } from './EmailTransporter';

export class EmailService implements IEmailService {
    private static instance: EmailService;
    private orderEmailService: OrderEmailService;
    private authEmailService: AuthEmailService;
    private emailTransporter: EmailTransporter;
    
    private constructor() {
        this.orderEmailService = OrderEmailService.getInstance();
        this.authEmailService = AuthEmailService.getInstance();
        this.emailTransporter = EmailTransporter.getInstance();
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    public static resetInstance(): void {
        if (EmailService.instance) {
            EmailService.instance = null as any;
        }
    }

    public async verifyTransporter(): Promise<boolean> {
        return this.emailTransporter.verifyTransporter();
    }

    async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
        return this.authEmailService.sendPasswordResetEmail(email, resetUrl);
    }

    async sendOrderConfirmationEmail(email: string, orderDetails: OrderDetail): Promise<void> {
        return this.orderEmailService.sendOrderConfirmationEmail(email, orderDetails);
    }

    async sendOrderCancellationEmail(email: string, orderDetails: OrderDetail): Promise<void> {
        return this.orderEmailService.sendOrderCancellationEmail(email, orderDetails);
    }

    async sendOrderApprovalEmail(email: string, orderDetails: OrderDetail): Promise<void> {
        return this.orderEmailService.sendOrderApprovalEmail(email, orderDetails);
    }

    async sendOrderRejectionEmail(email: string, orderDetails: OrderDetail, reason: string): Promise<void> {
        return this.orderEmailService.sendOrderRejectionEmail(email, orderDetails, reason);
    }

    public close(): void {
        this.emailTransporter.close();
    }
}