// src/contexts/OrderContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useOrder } from '../hooks/useOrder';
import { Order, OrderDto, PendingOrder, MyOrdersParams, PMOrdersParams } from '@cusTypes/orders';

interface OrderContextType {
    order: Order | null;
    pendingOrders: PendingOrder[];
    loading: boolean;
    error: string | null;
    createOrder: (orderData: OrderDto) => Promise<any>;
    getOrderDetails: (id: string) => Promise<any>;
    cancelOrder: (id: string) => Promise<any>;
    getPendingOrders: (page?: number, pageSize?: number) => Promise<any>;
    approveOrder: (id: string) => Promise<any>;
    rejectOrder: (id: string, reason: string) => Promise<any>;
    getUserOrders: (params: MyOrdersParams) => Promise<any>;
    getAllOrders: (params: PMOrdersParams) => Promise<any>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const orderHook = useOrder();

    return <OrderContext.Provider value={orderHook}>{children}</OrderContext.Provider>;
};

export const useOrderContext = (): OrderContextType => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrderContext must be used within an OrderProvider');
    }
    return context;
};
