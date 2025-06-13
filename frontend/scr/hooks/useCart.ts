// src/hooks/useCart.ts
import { useState, useCallback } from 'react';
import { Cart, DeliveryFeeCalculation } from '@cusTypes/cart';
import { useBaseHook } from './BaseHook';
import { ICartService } from '../api/interfaces/IApiService';
import { serviceFactory } from '../api/index';

export const useCart = (injectedCartService?: ICartService) => {
    const { loading, error, executeRequest, clearError } = useBaseHook();
    const [cart, setCart] = useState<Cart | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Use injected service, factory service, or legacy service as fallback
    const service = injectedCartService || serviceFactory.createCartService();

    const initialize = useCallback(async () => {
        return executeRequest(
            () => service.initialize(),
            (response) => {
                setSessionId(response.data.data?.session_id ?? null);
                return response.data;
            },
            'An error occurred during cart initialization'
        );
    }, [executeRequest, service]);

    const getContents = useCallback(async () => {
        return executeRequest(
            () => service.getContents(),
            (response) => {
                setCart(response.data.data ?? null);
                return response.data;
            },
            'An error occurred while fetching cart contents'
        );
    }, [executeRequest, service]);

    const addItem = useCallback(async (productId: number, quantity: number) => {
        return executeRequest(
            () => service.addItem(productId, quantity),
            (response) => {
                setCart(response.data.data ?? null);
                return response.data;
            },
            'An error occurred while adding item to cart'
        );
    }, [executeRequest, service]);

    const updateItemQuantity = useCallback(async (productId: number, quantity: number) => {
        return executeRequest(
            () => service.updateItemQuantity(productId, quantity),
            (response) => {
                setCart(response.data.data ?? null);
                return response.data;
            },
            'An error occurred while updating cart item'
        );
    }, [executeRequest, service]);

    const removeItem = useCallback(async (productId: number) => {
        return executeRequest(
            () => service.removeItem(productId),
            (response) => {
                setCart(response.data.data ?? null);
                return response.data;
            },
            'An error occurred while removing item from cart'
        );
    }, [executeRequest, service]);

    const validateCart = useCallback(async () => {
        return executeRequest(
            () => service.validateCart(),
            (response) => response.data,
            'An error occurred while validating cart'
        );
    }, [executeRequest, service]);

    const calculateDeliveryFees = useCallback(async (deliveryInfo: DeliveryFeeCalculation) => {
        return executeRequest(
            () => service.calculateDeliveryFees(deliveryInfo),
            (response) => response.data,
            'An error occurred while calculating delivery fees'
        );
    }, [executeRequest, service]);

    const clearCart = useCallback(async () => {
        return executeRequest(
            () => service.clearCart(),
            (response) => {
                setCart(null);
                return response.data;
            },
            'An error occurred while clearing cart'
        );
    }, [executeRequest, service]);

    return {
        cart,
        sessionId,
        loading,
        error,
        clearError,
        initialize,
        getContents,
        addItem,
        updateItemQuantity,
        removeItem,
        validateCart,
        calculateDeliveryFees,
        clearCart,
    };
};
