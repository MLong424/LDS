import { useState, useCallback } from 'react';

export interface BaseHookState {
    loading: boolean;
    error: string | null;
}

export const useBaseHook = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const executeRequest = useCallback(async <R>(
        apiCall: () => Promise<R>,
        successCallback?: (data: R) => void,
        errorMessage?: string
    ): Promise<R> => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await apiCall();
            if (successCallback) {
                successCallback(result);
            }
            return result;
        } catch (err: any) {
            const message = err.response?.data?.message || errorMessage || 'An error occurred';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        executeRequest,
        clearError: () => setError(null),
    };
};