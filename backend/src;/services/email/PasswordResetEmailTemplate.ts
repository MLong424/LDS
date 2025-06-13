// src/services/email/PasswordResetEmailTemplate.ts
import { EmailTemplateBase, EmailTemplateProps } from './EmailTemplateBase';

export class PasswordResetEmailTemplate extends EmailTemplateBase {
    protected getEmailTitle(): string {
        return 'Password Reset';
    }

    protected buildContent(props: EmailTemplateProps): string {
        const { resetUrl } = props;
        
        if (!resetUrl) {
            throw new Error('Reset URL is required for password reset email');
        }

        return `
            <p>Hello,</p>
            <p>We received a request to reset your password for your ${this.companyName} account. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
            <p class="link-backup">${resetUrl}</p>
            <p>Thank you,<br>The ${this.companyName} Team</p>
        `;
    }

    protected getCustomStyles(): string {
        return `
            .link-backup {
                word-break: break-all;
                color: #7f8c8d;
                font-size: 12px;
            }
        `;
    }
}