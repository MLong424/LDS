// src/contexts/PaymentContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { usePayment } from '../hooks/usePayment';
import { PaymentUrlRequest } from '@cusTypes/payments';

interface PaymentContextType {
    loading: boolean;
    error: string | null;
    createPaymentUrl: (data: PaymentUrlRequest) => Promise<any>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const paymentHook = usePayment();

    return <PaymentContext.Provider value={paymentHook}>{children}</PaymentContext.Provider>;
};

export const usePaymentContext = (): PaymentContextType => {
    const context = useContext(PaymentContext);
    if (context === undefined) {
        throw new Error('usePaymentContext must be used within a PaymentProvider');
    }
    return context;
};
