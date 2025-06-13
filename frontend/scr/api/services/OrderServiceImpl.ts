import { AxiosInstance, AxiosResponse } from 'axios';
import { Order, OrderDto } from '@cusTypes/orders';
import { ApiResponse } from '@cusTypes/common';
import { IOrderService } from '../interfaces/IApiService';

export default class OrderServiceImpl implements IOrderService {
    constructor(private apiClient: AxiosInstance) {}

    // New standardized interface methods
    getOrders(): Promise<AxiosResponse<ApiResponse<Order[]>>> {
        return this.apiClient.get<ApiResponse<Order[]>>('/orders');
    }

    getOrder(id: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    }

    createOrder(orderData: OrderDto): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.apiClient.post<ApiResponse<Order>>('/orders/create', orderData);
    }

    updateOrderStatus(orderId: string, status: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.apiClient.put<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
    }

    cancelOrder(orderId: string): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.post<ApiResponse>(`/orders/cancel/${orderId}`);
    }

    getPendingOrders(): Promise<AxiosResponse<ApiResponse<Order[]>>> {
        return this.apiClient.get<ApiResponse<Order[]>>('/orders/pending');
    }

    approveOrder(orderId: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.apiClient.post<ApiResponse<Order>>(`/orders/approve/${orderId}`);
    }

    rejectOrder(orderId: string, reason?: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.apiClient.post<ApiResponse<Order>>(`/orders/reject/${orderId}`, { reason });
    }

    // Legacy service methods for backward compatibility
    getOrderDetails(id: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.apiClient.get<ApiResponse<Order>>(`/orders/details/${id}`);
    }

    getUserOrders(params: any): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.apiClient.get<ApiResponse<any>>('/orders/my-orders', { params });
    }

    getAllOrders(params: any): Promise<AxiosResponse<ApiResponse<{
        orders: Order[];
        total_count: number;
        page: number;
        page_size: number;
    }>>> {
        return this.apiClient.get<ApiResponse<{
            orders: Order[];
            total_count: number;
            page: number;
            page_size: number;
        }>>('/orders/all', { params });
    }

    // Add missing getOrderById method
    getOrderById(id: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.apiClient.get<ApiResponse<Order>>(`/orders/by/${id}`);
    }
}