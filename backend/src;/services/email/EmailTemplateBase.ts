// src/services/email/EmailTemplateBase.ts
import { OrderDetail } from '../../models/entity/Order';

export interface EmailTemplateProps {
    companyName: string;
    supportEmail: string;
    orderDetails?: OrderDetail;
    resetUrl?: string;
    reason?: string;
}

export abstract class EmailTemplateBase {
    protected companyName: string;
    protected supportEmail: string;
    
    constructor(companyName: string, supportEmail: string) {
        this.companyName = companyName;
        this.supportEmail = supportEmail;
    }

    /**
     * Template method that defines the structure of email generation
     */
    public generateEmail(props: EmailTemplateProps): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            ${this.buildHeaders()}
        </head>
        <body>
            <div class="container">
                ${this.buildHeader()}
                <div class="content">
                    ${this.buildContent(props)}
                </div>
                ${this.buildFooter()}
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Common headers for all email templates
     */
    protected buildHeaders(): string {
        return `
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${this.getEmailTitle()}</title>
            <style>
                ${this.getCommonStyles()}
                ${this.getCustomStyles()}
            </style>
        `;
    }

    /**
     * Common header structure for all emails
     */
    protected buildHeader(): string {
        return `
            <div class="header">
                <h1>${this.companyName} - ${this.getEmailTitle()}</h1>
            </div>
        `;
    }

    /**
     * Common footer structure for all emails
     */
    protected buildFooter(): string {
        return `
            <div class="footer">
                <p>If you have any questions, please contact us at ${this.supportEmail}</p>
                <p>&copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
            </div>
        `;
    }

    /**
     * Common CSS styles for all emails
     */
    protected getCommonStyles(): string {
        return `
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
        `;
    }

    // Abstract methods that subclasses must implement
    protected abstract getEmailTitle(): string;
    protected abstract buildContent(props: EmailTemplateProps): string;
    protected abstract getCustomStyles(): string;
}