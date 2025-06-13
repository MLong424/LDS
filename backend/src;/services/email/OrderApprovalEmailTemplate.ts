// src/services/email/OrderApprovalEmailTemplate.ts
import { EmailTemplateBase, EmailTemplateProps } from './EmailTemplateBase';

export class OrderApprovalEmailTemplate extends EmailTemplateBase {
    protected getEmailTitle(): string {
        return 'Order Approved';
    }

    protected buildContent(props: EmailTemplateProps): string {
        const { orderDetails } = props;

        if (!orderDetails) {
            throw new Error('Order details are required for order approval email');
        }

        const { order_id, recipient_name } = orderDetails;

        return `
            <p>Hello ${recipient_name},</p>
            <p>Great news! Your order #${order_id} has been approved and is now being processed for shipment.</p>
            <p>We'll send you another notification with tracking information once your order has been shipped.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/orders/${order_id}" class="button">View Order Details</a>
            </div>
            <p>Thank you for shopping with us!</p>
            <p>Best regards,<br>The ${this.companyName} Team</p>
        `;
    }

    protected getCustomStyles(): string {
        return '';
    }
}
