// src/services/email/EmailTemplateFactory.ts
import { EmailTemplateBase } from './EmailTemplateBase';
import { PasswordResetEmailTemplate } from './PasswordResetEmailTemplate';
import { OrderConfirmationEmailTemplate } from './OrderConfirmationEmailTemplate';
import { OrderCancellationEmailTemplate } from './OrderCancellationEmailTemplate';
import { OrderApprovalEmailTemplate } from './OrderApprovalEmailTemplate';
import { OrderRejectionEmailTemplate } from './OrderRejectionEmailTemplate';

export type EmailTemplateType = 
    | 'PASSWORD_RESET' 
    | 'ORDER_CONFIRMATION' 
    | 'ORDER_CANCELLATION' 
    | 'ORDER_APPROVAL' 
    | 'ORDER_REJECTION';

export class EmailTemplateFactory {
    /**
     * Create an email template instance based on type
     * @param type Email template type
     * @param companyName Company name
     * @param supportEmail Support email address
     * @returns EmailTemplateBase instance
     */
    static createTemplate(
        type: EmailTemplateType,
        companyName: string,
        supportEmail: string
    ): EmailTemplateBase {
        switch (type) {
            case 'PASSWORD_RESET':
                return new PasswordResetEmailTemplate(companyName, supportEmail);
            
            case 'ORDER_CONFIRMATION':
                return new OrderConfirmationEmailTemplate(companyName, supportEmail);
            
            case 'ORDER_CANCELLATION':
                return new OrderCancellationEmailTemplate(companyName, supportEmail);
            
            case 'ORDER_APPROVAL':
                return new OrderApprovalEmailTemplate(companyName, supportEmail);
            
            case 'ORDER_REJECTION':
                return new OrderRejectionEmailTemplate(companyName, supportEmail);
            
            default:
                throw new Error(`Unsupported email template type: ${type}`);
        }
    }
}