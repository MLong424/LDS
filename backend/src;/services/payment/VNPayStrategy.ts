// src/services/payment/VNPayStrategy.ts
import moment from 'moment';
import querystring from 'qs';
import crypto from 'crypto';
import { PaymentResult } from '../interfaces/IPaymentService';
import { IPaymentStrategy, PaymentData } from '../interfaces/IPaymentStrategy';

export interface VNPayConfig {
    merchantId: string;
    secureKey: string;
    paymentUrl: string;
    returnUrl: string;
    apiUrl: string;
}

export class VNPayStrategy implements IPaymentStrategy {
    private config: VNPayConfig;

    constructor(config: VNPayConfig) {
        this.config = config;
    }

    getName(): string {
        return 'VNPAY';
    }

    private sortObject(obj: Record<string, string>): Record<string, string> {
        let sorted: Record<string, string> = {};
        let str = [];
        let key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }

        str.sort();

        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
        }

        return sorted;
    }

    public createPaymentUrl(paymentData: PaymentData): string {
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const ipAddr = '127.0.0.1';

        const amountInCents = Math.round(paymentData.amount * 100);
        const locale = 'vn';
        const currCode = 'VND';
        const orderInfo = `Thanh toan cho ma GD: ${paymentData.orderId}`;

        let vnp_Params: Record<string, any> = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = this.config.merchantId;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = paymentData.orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = '150000';
        vnp_Params['vnp_Amount'] = amountInCents;
        vnp_Params['vnp_ReturnUrl'] = this.config.returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = this.sortObject(vnp_Params);

        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac('sha512', this.config.secureKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        return this.config.paymentUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
    }

    public async verifyReturnParameters(params: Record<string, string>): Promise<PaymentResult> {
        try {
            let vnp_Params: Record<string, string> = { ...params };
            const secureHash = vnp_Params['vnp_SecureHash'];
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const orderId: string = vnp_Params['vnp_TxnRef'];
            const transactionId = vnp_Params['vnp_TransactionNo'];
            const amount = Number(vnp_Params['vnp_Amount']) / 100;
            const payDate = vnp_Params['vnp_PayDate'];
            const orderInfo = vnp_Params['vnp_OrderInfo'];

            // Remove hash from verification
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = this.sortObject(vnp_Params);

            // Verify signature
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac('sha512', this.config.secureKey);
            let calculated = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            if (secureHash !== calculated) {
                return {
                    success: false,
                    orderId,
                    errorCode: 'INVALID_SIGNATURE',
                    errorMessage: 'Invalid signature from payment provider',
                    providerData: {
                        responseCode,
                        locale: vnp_Params['vnp_Locale'],
                        currencyCode: vnp_Params['vnp_CurrCode'],
                    }
                };
            }

            // Check response code
            if (responseCode !== '00') {
                return {
                    success: false,
                    orderId,
                    transactionId,
                    errorCode: responseCode,
                    errorMessage: `Payment failed with code: ${responseCode}`,
                    providerData: {
                        responseCode,
                        locale: vnp_Params['vnp_Locale'],
                        currencyCode: vnp_Params['vnp_CurrCode'],
                    }
                };
            }

            // Return successful verification result
            return {
                success: true,
                orderId,
                amount,
                orderInfo,
                transactionId,
                providerData: {
                    responseCode,
                    locale: vnp_Params['vnp_Locale'],
                    currencyCode: vnp_Params['vnp_CurrCode'],
                    bankCode: vnp_Params['vnp_BankCode'],
                    payDate
                }
            };
        } catch (error) {
            console.error('Error verifying VNPay return parameters:', error);
            return {
                success: false,
                orderId: '',
                errorCode: 'SERVER_ERROR',
                errorMessage: error instanceof Error ? error.message : 'Unknown server error'
            };
        }
    }
}