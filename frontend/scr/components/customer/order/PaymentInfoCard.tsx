// src/components/order/PaymentInfoCard.tsx
import React from 'react';
import { PaymentInfo } from '@cusTypes/payments';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { CreditCard, CalendarDays } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';

interface PaymentInfoCardProps {
    paymentInfo: PaymentInfo[];
}

const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({ paymentInfo }) => {
    if (!paymentInfo || paymentInfo.length === 0) {
        return null;
    }
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {paymentInfo.map((payment, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium">
                                    Payment {paymentInfo.length > 1 ? `#${index + 1}` : ''}
                                </h3>
                                <OrderStatusBadge status={payment.payment_status} />
                            </div>
                            
                            <div className="grid gap-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment ID:</span>
                                    <span>{payment.payment_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span>{payment.amount} VND</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method:</span>
                                    <div className="flex items-center">
                                        <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                                        <span>{payment.payment_method}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <div className="flex items-center">
                                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                                        <span>{formatDate(payment.created_at)}</span>
                                    </div>
                                </div>
                                
                                {payment.payment_method === 'VNPAY' && payment.vnpay_transaction_id && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">VNPAY Transaction ID:</span>
                                        <span>{payment.vnpay_transaction_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentInfoCard;