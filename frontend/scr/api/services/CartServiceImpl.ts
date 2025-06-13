import { AxiosInstance, AxiosResponse } from 'axios';
import { Cart, CartItem } from '@cusTypes/cart';
import { ApiResponse } from '@cusTypes/common';
import { ICartService } from '../interfaces/IApiService';

export default class CartServiceImpl implements ICartService {
    constructor(private apiClient: AxiosInstance) {}

    // New standardized interface methods
    getCart(): Promise<AxiosResponse<ApiResponse<Cart>>> {
        return this.apiClient.get<ApiResponse<Cart>>('/cart');
    }

    addToCart(productId: number, quantity: number): Promise<AxiosResponse<ApiResponse<CartItem>>> {
        return this.apiClient.post<ApiResponse<CartItem>>('/cart/items', {
            product_id: productId,
            quantity,
        });
    }

    updateCartItem(itemId: number, quantity: number): Promise<AxiosResponse<ApiResponse<CartItem>>> {
        return this.apiClient.put<ApiResponse<CartItem>>(`/cart/items/${itemId}`, {
            quantity,
        });
    }

    removeFromCart(itemId: number): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.delete<ApiResponse>(`/cart/items/${itemId}`);
    }

    clearCart(): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.delete<ApiResponse>('/cart');
    }

    // Legacy service methods for backward compatibility
    initialize(): Promise<AxiosResponse<ApiResponse<{ session_id: string; cart_type: string }>>> {
        return this.apiClient.get<ApiResponse<{ session_id: string; cart_type: string }>>('/cart/initialize');
    }

    getContents(): Promise<AxiosResponse<ApiResponse<Cart>>> {
        return this.apiClient.get<ApiResponse<Cart>>('/cart');
    }

    addItem(productId: number, quantity: number): Promise<AxiosResponse<ApiResponse<Cart>>> {
        return this.apiClient.post<ApiResponse<Cart>>('/cart/items', {
            product_id: productId,
            quantity,
        });
    }

    updateItemQuantity(productId: number, quantity: number): Promise<AxiosResponse<ApiResponse<Cart>>> {
        return this.apiClient.put<ApiResponse<Cart>>(`/cart/items/${productId}`, {
            quantity,
        });
    }

    removeItem(productId: number): Promise<AxiosResponse<ApiResponse<Cart>>> {
        return this.apiClient.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);
    }

    validateCart(): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.apiClient.get<ApiResponse<any>>('/cart/validate');
    }

    calculateDeliveryFees(deliveryInfo: any): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.apiClient.post<ApiResponse<any>>('/cart/delivery-fees', {
            province: deliveryInfo.province,
            address: deliveryInfo.address,
            is_rush_delivery: deliveryInfo.is_rush_delivery,
        });
    }
}