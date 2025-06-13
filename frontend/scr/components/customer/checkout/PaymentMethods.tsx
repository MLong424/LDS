// src/components/checkout/PaymentMethods.tsx
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';

interface PaymentMethodsProps {
    onProceedToPayment: () => void;
    loading: boolean;
    orderTotal: number;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
    onProceedToPayment,
    loading,
    orderTotal,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start space-x-2 p-4 rounded-md bg-muted/50 mb-6">
                    <div className="grid gap-1 flex-1">
                        <Label className="font-medium flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            VNPAY
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Pay securely with your credit card via VNPAY gateway
                        </p>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-md">
                    <div className="flex justify-between font-medium mb-4">
                        <span>Total Amount:</span>
                        <span>{orderTotal} VND</span>
                    </div>
                    <Button onClick={onProceedToPayment} disabled={loading} className="w-full" size="lg">
                        {loading ? 'Processing...' : 'Pay Now with VNPAY'}
                    </Button>
                    <p className="mt-2 text-xs text-center text-muted-foreground">
                        By proceeding, you agree to our terms of service and privacy policy
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentMethods;