// src/AppProvider.tsx
import React, { ReactNode } from 'react';
import { AuthProvider } from '@contexts/AuthContext';
import { CartProvider } from '@contexts/CartContext';
import { OrderProvider } from '@contexts/OrderContext';
import { PaymentProvider } from '@contexts/PaymentContext';
import { ProductProvider } from '@contexts/ProductContext';

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return (
        <AuthProvider>
            <CartProvider>
                <ProductProvider>
                    <OrderProvider>
                        <PaymentProvider>{children}</PaymentProvider>
                    </OrderProvider>
                </ProductProvider>
            </CartProvider>
        </AuthProvider>
    );
};

export default AppProvider;
