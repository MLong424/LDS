// src/services/AuthEmailService.ts
import { EmailTemplateFactory } from './EmailTemplateFactory';
import { EmailTransporter } from './EmailTransporter';

export class AuthEmailService {
    private static instance: AuthEmailService;
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

    public static getInstance(): AuthEmailService {
        if (!AuthEmailService.instance) {
            AuthEmailService.instance = new AuthEmailService();
        }
        return AuthEmailService.instance;
    }

    public static resetInstance(): void {
        AuthEmailService.instance = null as any;
    }

    async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
        try {
            const template = EmailTemplateFactory.createTemplate('PASSWORD_RESET', this.companyName, this.supportEmail);

            const htmlContent = template.generateEmail({
                resetUrl,
                companyName: this.companyName,
                supportEmail: this.supportEmail,
            });

            await this.emailTransporter.sendMail({
                from: `"${this.companyName}" <${this.fromEmail}>`,
                to: email,
                subject: 'Reset Your Password',
                html: htmlContent,
            });
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error(
                `Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
