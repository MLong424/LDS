// src/contexts/CartContext.tsx
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { Cart, DeliveryFeeCalculation } from '@cusTypes/cart';

interface CartContextType {
    cart: Cart | null;
    sessionId: string | null;
    loading: boolean;
    error: string | null;
    initialize: () => Promise<any>;
    getContents: () => Promise<any>;
    addItem: (productId: number, quantity: number) => Promise<any>;
    updateItemQuantity: (productId: number, quantity: number) => Promise<any>;
    removeItem: (productId: number) => Promise<any>;
    validateCart: () => Promise<any>;
    calculateDeliveryFees: (deliveryInfo: DeliveryFeeCalculation) => Promise<any>;
    clearCart: () => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const cartHook = useCart();

    // Initialize cart when the component mounts
    useEffect(() => {
        const initializeCart = async () => {
            try {
                await cartHook.initialize();
                await cartHook.getContents();
            } catch (error) {
                // Handle initialization error
            }
        };

        initializeCart();
    }, []);

    return <CartContext.Provider value={cartHook}>{children}</CartContext.Provider>;
};

export const useCartContext = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCartContext must be used within a CartProvider');
    }
    return context;
};
