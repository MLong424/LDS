// src/services/email/OrderConfirmationEmailTemplate.ts
import { EmailTemplateBase, EmailTemplateProps } from './EmailTemplateBase';

export class OrderConfirmationEmailTemplate extends EmailTemplateBase {
    protected getEmailTitle(): string {
        return 'Order Confirmation';
    }

    protected buildContent(props: EmailTemplateProps): string {
        const { orderDetails } = props;

        if (!orderDetails) {
            throw new Error('Order details are required for order confirmation email');
        }

        const { order_id, recipient_name, delivery_address, delivery_province } = orderDetails;

        // Generate order items HTML
        const itemsHtml = orderDetails.items
            .map(
                (item) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">Product ID: ${item.product_id}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${
                    item.unit_price * item.quantity
                }</td>
            </tr>
        `
            )
            .join('');

        return `
            <p>Hello ${recipient_name},</p>
            <p>Thank you for your order! We're processing it now and will notify you when it's on its way.</p>
            
            <div class="order-info">
                <h2>Order Information</h2>
                <p><strong>Order Number:</strong> ${order_id}</p>
                <p><strong>Order Date:</strong> ${new Date(orderDetails.created_at).toLocaleString()}</p>
                <p><strong>Order Status:</strong> ${orderDetails.order_status}</p>
                <p><strong>Shipping Address:</strong> ${delivery_address}, ${delivery_province}</p>
            </div>
            
            <h2>Order Summary</h2>
            <table class="order-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="order-summary">
                <p><strong>Subtotal:</strong> ${orderDetails.products_total}</p>
                <p><strong>VAT (10%):</strong> ${orderDetails.vat_amount}</p>
                <p><strong>Shipping:</strong> ${orderDetails.delivery_fee}</p>
                ${
                    orderDetails.rush_delivery_fee > 0
                        ? `<p><strong>Rush Delivery Fee:</strong> ${orderDetails.rush_delivery_fee}</p>`
                        : ''
                }
                <p class="total-row"><strong>Total:</strong> ${orderDetails.total_amount}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/orders/${order_id}" class="button">View Order Details</a>
            </div>
            
            <p>Thank you for shopping with us!</p>
            <p>Best regards,<br>The ${this.companyName} Team</p>
        `;
    }

    protected getCustomStyles(): string {
        return `
            .order-info {
                margin-bottom: 30px;
            }
            .order-info p {
                margin: 5px 0;
            }
            .order-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .order-table th {
                background-color: #f2f2f2;
                padding: 10px;
                text-align: left;
            }
            .order-summary {
                margin-top: 20px;
                border-top: 2px solid #eee;
                padding-top: 20px;
            }
            .total-row {
                font-weight: bold;
            }
        `;
    }
}
