// src/api/services/orderService.ts
import { axiosInstance } from '../config';
import { OrderDto, Order, PendingOrder, MyOrdersParams, PMOrdersParams } from '@cusTypes/orders';
import { ApiResponse } from '@cusTypes/common';

const orderService = {
    createOrder: (orderData: OrderDto) =>
        axiosInstance.post<
            ApiResponse<{
                order_id: string;
                products_total: number;
                vat_amount: number;
                delivery_fee: number;
                rush_delivery_fee: number;
                total_amount: number;
            }>
        >('/orders/create', orderData),

    getOrderDetails: (id: string) => axiosInstance.get<ApiResponse<Order>>(`/orders/details/${id}`),

    cancelOrder: (id: string) => axiosInstance.post<ApiResponse>(`/orders/cancel/${id}`),

    // Product Manager Order Management endpoints
    getPendingOrders: (page = 1, pageSize = 30) =>
        axiosInstance.get<
            ApiResponse<{
                orders: PendingOrder[];
                page: number;
                page_size: number;
            }>
        >('/orders/pending', {
            params: { page, page_size: pageSize },
        }),

    approveOrder: (id: string) => axiosInstance.post<ApiResponse>(`/orders/approve/${id}`),

    rejectOrder: (id: string, reason: string) => axiosInstance.post<ApiResponse>(`/orders/reject/${id}`, { reason }),

    getUserOrders: (params: MyOrdersParams) => axiosInstance.get<ApiResponse<{
        orders: Order[];
        total_count: number;
        page: number;
        page_size: number;
    }>>(`/orders/my-orders`, { params }),

    getAllOrders: (params: PMOrdersParams) => axiosInstance.get<ApiResponse<{
        orders: Order[];
        total_count: number;
        page: number;
        page_size: number;
    }>>(`/orders/all`, { params }),

    // Add missing getOrderById method
    getOrderById: (id: string) => axiosInstance.get<ApiResponse<Order>>(`/orders/by/${id}`),
};

export default orderService;
