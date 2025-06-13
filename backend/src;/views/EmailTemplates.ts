// src/views/EmailTemplates.ts
import { OrderDetail } from '../models/entity/Order';

interface PasswordResetTemplateProps {
    resetUrl: string;
    companyName: string;
    supportEmail: string;
}

interface OrderEmailTemplateProps {
    orderDetails: OrderDetail;
    companyName: string;
    supportEmail: string;
    reason?: string; // For rejection emails
}

class EmailTemplates {
    /**
     * Get HTML template for password reset emails
     */
    static getPasswordResetTemplate(props: PasswordResetTemplateProps): string {
        const { resetUrl, companyName, supportEmail } = props;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px 20px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .button:hover {
                    background-color: #2980b9;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #7f8c8d;
                    border-top: 1px solid #eee;
                }
                .link-backup {
                    word-break: break-all;
                    color: #7f8c8d;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${companyName} - Password Reset</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your ${companyName} account. If you didn't make this request, you can safely ignore this email.</p>
                    <p>To reset your password, click the button below:</p>
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </div>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                    <p class="link-backup">${resetUrl}</p>
                    <p>Thank you,<br>The ${companyName} Team</p>
                </div>
                <div class="footer">
                    <p>If you have any questions, please contact us at ${supportEmail}</p>
                    <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get HTML template for order confirmation emails
     */
    static getOrderConfirmationTemplate(props: OrderEmailTemplateProps): string {
        const { orderDetails, companyName, supportEmail } = props;
        const { order_id, recipient_name, total_amount, delivery_address, delivery_province } = orderDetails;
        

        // Generate order items HTML
        const itemsHtml = orderDetails.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">Product ID: ${item.product_id}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price * item.quantity}</td>
            </tr>
        `).join('');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px 20px;
                }
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
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #7f8c8d;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${companyName} - Order Confirmation</h1>
                </div>
                <div class="content">
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
                        ${orderDetails.rush_delivery_fee > 0 ? 
                            `<p><strong>Rush Delivery Fee:</strong> ${orderDetails.rush_delivery_fee}</p>` : ''}
                        <p class="total-row"><strong>Total:</strong> ${orderDetails.total_amount}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL}/orders/${order_id}" class="button">View Order Details</a>
                    </div>
                    
                    <p>Thank you for shopping with us!</p>
                    <p>Best regards,<br>The ${companyName} Team</p>
                </div>
                <div class="footer">
                    <p>If you have any questions, please contact us at ${supportEmail}</p>
                    <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get HTML template for order cancellation emails
     */
    static getOrderCancellationTemplate(props: OrderEmailTemplateProps): string {
        const { orderDetails, companyName, supportEmail } = props;
        const { order_id, recipient_name, total_amount } = orderDetails;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Cancellation</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px 20px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #7f8c8d;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${companyName} - Order Cancellation</h1>
                </div>
                <div class="content">
                    <p>Hello ${recipient_name},</p>
                    <p>Your order #${order_id} has been successfully cancelled.</p>
                    <p>If your payment was already processed, a refund will be issued to your original payment method. Please allow 3-5 business days for the refund to appear in your account.</p>
                    <p>Order Total: ${total_amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}</p>
                    <p>If you have any questions about your cancellation or refund, please don't hesitate to contact our customer service.</p>
                    <p>Thank you for your understanding.</p>
                    <p>Best regards,<br>The ${companyName} Team</p>
                </div>
                <div class="footer">
                    <p>If you have any questions, please contact us at ${supportEmail}</p>
                    <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get HTML template for order approval emails
     */
    static getOrderApprovalTemplate(props: OrderEmailTemplateProps): string {
        const { orderDetails, companyName, supportEmail } = props;
        const { order_id, recipient_name } = orderDetails;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Approved</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px 20px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #7f8c8d;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${companyName} - Order Approved</h1>
                </div>
                <div class="content">
                    <p>Hello ${recipient_name},</p>
                    <p>Great news! Your order #${order_id} has been approved and is now being processed for shipment.</p>
                    <p>We'll send you another notification with tracking information once your order has been shipped.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL}/orders/${order_id}" class="button">View Order Details</a>
                    </div>
                    <p>Thank you for shopping with us!</p>
                    <p>Best regards,<br>The ${companyName} Team</p>
                </div>
                <div class="footer">
                    <p>If you have any questions, please contact us at ${supportEmail}</p>
                    <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get HTML template for order rejection emails
     */
    static getOrderRejectionTemplate(props: OrderEmailTemplateProps): string {
        const { orderDetails, reason, companyName, supportEmail } = props;
        const { order_id, recipient_name, total_amount } = orderDetails;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Rejected</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px 20px;
                }
                .reason-box {
                    background-color: #f8f9fa;
                    border-left: 4px solid #dc3545;
                    padding: 15px;
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #7f8c8d;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${companyName} - Order Rejected</h1>
                </div>
                <div class="content">
                    <p>Hello ${recipient_name},</p>
                    <p>We regret to inform you that your order #${order_id} has been rejected.</p>
                    
                    <div class="reason-box">
                        <p><strong>Reason for rejection:</strong> ${reason}</p>
                    </div>
                    
                    <p>If your payment was already processed, a refund will be issued to your original payment method. Please allow 3-5 business days for the refund to appear in your account.</p>
                    <p>Order Total: ${total_amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}</p>
                    <p>We apologize for any inconvenience this may have caused. Please don't hesitate to contact our customer service if you have any questions.</p>
                    <p>Thank you for your understanding.</p>
                    <p>Best regards,<br>The ${companyName} Team</p>
                </div>
                <div class="footer">
                    <p>If you have any questions, please contact us at ${supportEmail}</p>
                    <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

export default EmailTemplates;