import { OrderDetail } from "../../models/entity/Order";

export interface IEmailService {
    sendPasswordResetEmail(email: string, resetUrl: string): Promise<void>;
    sendOrderConfirmationEmail(email: string, orderDetails: OrderDetail): Promise<void>;
    sendOrderCancellationEmail(email: string, orderDetails: OrderDetail): Promise<void>;
    sendOrderApprovalEmail(email: string, orderDetails: OrderDetail): Promise<void>;
    sendOrderRejectionEmail(email: string, orderDetails: OrderDetail, reason: string): Promise<void>;
}