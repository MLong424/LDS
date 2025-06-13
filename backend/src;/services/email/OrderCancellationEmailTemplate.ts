// src/services/email/OrderCancellationEmailTemplate.ts
import { EmailTemplateBase, EmailTemplateProps } from './EmailTemplateBase';

export class OrderCancellationEmailTemplate extends EmailTemplateBase {
    protected getEmailTitle(): string {
        return 'Order Cancellation';
    }

    protected buildContent(props: EmailTemplateProps): string {
        const { orderDetails } = props;
        
        if (!orderDetails) {
            throw new Error('Order details are required for order cancellation email');
        }

        const { order_id, recipient_name, total_amount } = orderDetails;

        return `
            <p>Hello ${recipient_name},</p>
            <p>Your order #${order_id} has been successfully cancelled.</p>
            <p>If your payment was already processed, a refund will be issued to your original payment method. Please allow 3-5 business days for the refund to appear in your account.</p>
            <p>Order Total: ${total_amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}</p>
            <p>If you have any questions about your cancellation or refund, please don't hesitate to contact our customer service.</p>
            <p>Thank you for your understanding.</p>
            <p>Best regards,<br>The ${this.companyName} Team</p>
        `;
    }

    protected getCustomStyles(): string {
        return '';
    }
}