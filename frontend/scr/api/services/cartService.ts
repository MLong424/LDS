// src/api/services/cartService.ts
import { axiosInstance } from '../config';
import { Cart, CartValidationResult, DeliveryFeeCalculation, DeliveryFeeResult } from '@cusTypes/cart';
import { ApiResponse } from '@cusTypes/common';

const cartService = {
    initialize: () =>
        axiosInstance.get<
            ApiResponse<{
                session_id: string;
                cart_type: string;
            }>
        >('/cart/initialize'),

    getContents: () => axiosInstance.get<ApiResponse<Cart>>('/cart'),

    addItem: (productId: number, quantity: number) =>
        axiosInstance.post<ApiResponse<Cart>>('/cart/items', {
            product_id: productId,
            quantity,
        }),

    updateItemQuantity: (productId: number, quantity: number) =>
        axiosInstance.put<ApiResponse<Cart>>(`/cart/items/${productId}`, {
            quantity,
        }),

    removeItem: (productId: number) => axiosInstance.delete<ApiResponse<Cart>>(`/cart/items/${productId}`),

    validateCart: () => axiosInstance.get<ApiResponse<CartValidationResult>>('/cart/validate'),

    calculateDeliveryFees: (deliveryInfo: DeliveryFeeCalculation) =>
        axiosInstance.post<ApiResponse<DeliveryFeeResult>>('/cart/delivery-fees', {
            province: deliveryInfo.province,
            address: deliveryInfo.address,
            is_rush_delivery: deliveryInfo.is_rush_delivery,
        }),

    clearCart: () => axiosInstance.delete<ApiResponse>('/cart'),
};

export default cartService;
