// src/services/email/OrderRejectionEmailTemplate.ts
import { EmailTemplateBase, EmailTemplateProps } from './EmailTemplateBase';

export class OrderRejectionEmailTemplate extends EmailTemplateBase {
    protected getEmailTitle(): string {
        return 'Order Rejected';
    }

    protected buildContent(props: EmailTemplateProps): string {
        const { orderDetails, reason } = props;

        if (!orderDetails) {
            throw new Error('Order details are required for order rejection email');
        }

        if (!reason) {
            throw new Error('Rejection reason is required for order rejection email');
        }

        const { order_id, recipient_name, total_amount } = orderDetails;

        return `
            <p>Hello ${recipient_name},</p>
            <p>We regret to inform you that your order #${order_id} has been rejected.</p>
            
            <div class="reason-box">
                <p><strong>Reason for rejection:</strong> ${reason}</p>
            </div>
            
            <p>If your payment was already processed, a refund will be issued to your original payment method. Please allow 3-5 business days for the refund to appear in your account.</p>
            <p>Order Total: ${total_amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}</p>
            <p>We apologize for any inconvenience this may have caused. Please don't hesitate to contact our customer service if you have any questions.</p>
            <p>Thank you for your understanding.</p>
            <p>Best regards,<br>The ${this.companyName} Team</p>
        `;
    }

    protected getCustomStyles(): string {
        return `
            .reason-box {
                background-color: #f8f9fa;
                border-left: 4px solid #dc3545;
                padding: 15px;
                margin: 20px 0;
            }
        `;
    }
}
