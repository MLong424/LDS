// src/hooks/useOrder.ts
import { useState, useCallback } from 'react';
import { OrderDto, Order, PendingOrder, MyOrdersParams, PMOrdersParams } from '@cusTypes/orders';
import { useBaseHook } from './BaseHook';
import { IOrderService } from '../api/interfaces/IApiService';
import { serviceFactory } from '../api/index';

export const useOrder = (injectedOrderService?: IOrderService) => {
    const { loading, error, executeRequest, clearError } = useBaseHook();
    const [order, setOrder] = useState<Order | null>(null);
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

    // Use injected service, factory service, or legacy service as fallback
    const service = injectedOrderService || serviceFactory.createOrderService();

    const createOrder = useCallback(async (orderData: OrderDto) => {
        return executeRequest(
            () => service.createOrder(orderData),
            (response) => response.data,
            'An error occurred while creating order'
        );
    }, [executeRequest, service]);

    const getOrderDetails = useCallback(async (id: string) => {
        return executeRequest(
            () => service.getOrderDetails(id),
            (response) => {
                setOrder(response.data.data ?? null);
                return response.data;
            },
            'An error occurred while fetching order details'
        );
    }, [executeRequest, service]);

    const cancelOrder = useCallback(async (id: string) => {
        return executeRequest(
            () => service.cancelOrder(id),
            (response) => response.data,
            'An error occurred while cancelling order'
        );
    }, [executeRequest, service]);

    // Product Manager Order Management endpoints
    const getPendingOrders = useCallback(async () => {
        return executeRequest(
            () => service.getPendingOrders(),
            (response) => {
                const orders = response.data.data ?? [];
                // Convert Order[] to PendingOrder[] by mapping only needed fields
                const pendingOrders = orders.map((order: Order): PendingOrder => ({
                    id: order.id,
                    recipient_name: order.recipient_name,
                    recipient_email: order.recipient_email,
                    recipient_phone: order.recipient_phone,
                    delivery_province: order.delivery_province,
                    delivery_address: order.delivery_address,
                    total_amount: order.total_amount,
                    payment_status: order.payment_status,
                    created_at: order.created_at,
                    has_sufficient_stock: true // Default to true, should be determined by backend
                }));
                setPendingOrders(pendingOrders);
                return response.data;
            },
            'An error occurred while fetching pending orders'
        );
    }, [executeRequest, service]);

    const approveOrder = useCallback(
        async (id: string) => {
            return executeRequest(
                () => service.approveOrder(id),
                (response) => {
                    // Refresh pending orders after approval
                    getPendingOrders();
                    return response.data;
                },
                'An error occurred while approving order'
            );
        },
        [executeRequest, service, getPendingOrders]
    );

    const rejectOrder = useCallback(
        async (id: string, reason: string) => {
            return executeRequest(
                () => service.rejectOrder(id, reason),
                (response) => {
                    // Refresh pending orders after rejection
                    getPendingOrders();
                    return response.data;
                },
                'An error occurred while rejecting order'
            );
        },
        [executeRequest, service, getPendingOrders]
    );

    const getUserOrders = useCallback(
        async (params: MyOrdersParams) => {
            return executeRequest(
                () => service.getUserOrders(params),
                (response) => response.data.data,
                'An error occurred while fetching user orders'
            );
        },
        [executeRequest, service]
    );

    const getAllOrders = useCallback(
        async (params: PMOrdersParams) => {
            return executeRequest(
                () => service.getAllOrders(params),
                (response) => response.data,
                'An error occurred while fetching all orders'
            );
        },
        [executeRequest, service]
    );

    return {
        order,
        pendingOrders,
        loading,
        error,
        clearError,
        createOrder,
        getOrderDetails,
        cancelOrder,
        getPendingOrders,
        approveOrder,
        rejectOrder,
        getUserOrders,
        getAllOrders,
    };
};
