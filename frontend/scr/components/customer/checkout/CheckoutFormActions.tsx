// src/components/customer/checkout/CheckoutFormActions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

interface CheckoutFormActionsProps {
    loading: boolean;
    error: string | null;
}

export const CheckoutFormActions: React.FC<CheckoutFormActionsProps> = ({
    loading,
    error,
}) => {
    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Continue to Payment'}
            </Button>
        </>
    );
};