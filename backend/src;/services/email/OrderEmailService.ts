// src/services/email/OrderEmailService.ts
import { IEmailService } from '../interfaces/IEmailService';
import { OrderDetail } from '../../models/entity/Order';
import { EmailTemplateFactory, EmailTemplateType } from './EmailTemplateFactory';
import { EmailTemplateProps } from './EmailTemplateBase';
import { EmailTransporter } from './EmailTransporter';

export class OrderEmailService implements IEmailService {
    private static instance: OrderEmailService;
    private readonly companyName: string;
    private readonly supportEmail: string;
    private readonly fromEmail: string;
    private emailTransporter: EmailTransporter;
    
    private constructor() {
        this.companyName = process.env.COMPANY_NAME || 'AIMS: An Internet Media Store';
        this.supportEmail = process.env.SUPPORT_EMAIL || 'support@aims.example.com';
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@aims.example.com';
        this.emailTransporter = EmailTransporter.getInstance();
    }

    public static getInstance(): OrderEmailService {
        if (!OrderEmailService.instance) {
            OrderEmailService.instance = new OrderEmailService();
        }
        return OrderEmailService.instance;
    }

    public static resetInstance(): void {
        OrderEmailService.instance = null as any;
    }

    private async sendEmailWithTemplate(
        templateType: EmailTemplateType,
        to: string,
        subject: string,
        props: EmailTemplateProps
    ): Promise<void> {
        try {
            const template = EmailTemplateFactory.createTemplate(
                templateType,
                this.companyName,
                this.supportEmail
            );

            const htmlContent = template.generateEmail({
                ...props,
                companyName: this.companyName,
                supportEmail: this.supportEmail
            });

            await this.emailTransporter.sendMail({
                from: `"${this.companyName}" <${this.fromEmail}>`,
                to,
                subject,
                html: htmlContent
            });
        } catch (error) {
            console.error(`Error sending ${templateType} email:`, error);
            throw new Error(`Failed to send ${templateType} email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async sendOrderConfirmationEmail(email: string, orderDetails: OrderDetail): Promise<void> {
        await this.sendEmailWithTemplate(
            'ORDER_CONFIRMATION',
            email,
            `Order Confirmation #${orderDetails.order_id}`,
            { orderDetails, companyName: this.companyName, supportEmail: this.supportEmail }
        );
    }

    async sendOrderCancellationEmail(email: string, orderDetails: OrderDetail): Promise<void> {
        await this.sendEmailWithTemplate(
            'ORDER_CANCELLATION',
            email,
            `Order Cancellation #${orderDetails.order_id}`,
            { orderDetails, companyName: this.companyName, supportEmail: this.supportEmail }
        );
    }

    async sendOrderApprovalEmail(email: string, orderDetails: OrderDetail): Promise<void> {
        await this.sendEmailWithTemplate(
            'ORDER_APPROVAL',
            email,
            `Order Approved #${orderDetails.order_id}`,
            { orderDetails, companyName: this.companyName, supportEmail: this.supportEmail }
        );
    }

    async sendOrderRejectionEmail(email: string, orderDetails: OrderDetail, reason: string): Promise<void> {
        await this.sendEmailWithTemplate(
            'ORDER_REJECTION',
            email,
            `Order Rejected #${orderDetails.order_id}`,
            { orderDetails, reason, companyName: this.companyName, supportEmail: this.supportEmail }
        );
    }

    // Not applicable for OrderEmailService
    async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
        throw new Error('Password reset emails should be handled by AuthEmailService');
    }
}
