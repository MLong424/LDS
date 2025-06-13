// src/hooks/usePayment.ts
import { useCallback } from 'react';
import { PaymentUrlRequest } from '@cusTypes/payments';
import { useBaseHook } from './BaseHook';
import { IPaymentService } from '../api/interfaces/IApiService';
import { serviceFactory } from '../api/index';

export const usePayment = (injectedPaymentService?: IPaymentService) => {
    const { loading, error, executeRequest, clearError } = useBaseHook();

    // Use injected service, factory service, or legacy service as fallback
    const service = injectedPaymentService || serviceFactory.createPaymentService();

    const createPaymentUrl = useCallback(async (data: PaymentUrlRequest) => {
        return executeRequest(
            () => service.createPaymentUrl(data),
            (response) => response.data,
            'An error occurred while creating payment URL'
        );
    }, [executeRequest, service]);

    return {
        loading,
        error,
        clearError,
        createPaymentUrl
    };
};
