// Enhanced useAuth hook with dependency injection
import { useState, useCallback } from 'react';
import { RegisterUserDto, LoginCredentials, User, ChangePasswordDto } from '@cusTypes/auth';
import { useBaseHook } from './BaseHook';
import { IAuthService } from '../api/interfaces/IApiService';
import { serviceFactory } from '../api/index';

export const useAuthWithDI = (authService?: IAuthService) => {
    const { loading, error, executeRequest, clearError } = useBaseHook();
    const [user, setUser] = useState<User | null>(null);
    
    // Use injected service or default from factory
    const service = authService || serviceFactory.createAuthService();

    const register = useCallback(async (userData: RegisterUserDto) => {
        return executeRequest(
            () => service.register(userData),
            (response) => response.data,
            'An error occurred during registration'
        );
    }, [executeRequest, service]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        return executeRequest(
            () => service.login(credentials),
            (response) => {
                setUser(response.data.data ?? null);
                return response.data;
            },
            'An error occurred during login'
        );
    }, [executeRequest, service]);

    const logout = useCallback(async () => {
        return executeRequest(
            () => service.logout(),
            (response) => {
                setUser(null);
                return response.data;
            },
            'An error occurred during logout'
        );
    }, [executeRequest, service]);

    const forgotPassword = useCallback(async (email: string) => {
        return executeRequest(
            () => service.forgotPassword(email),
            (response) => response.data,
            'An error occurred during password reset request'
        );
    }, [executeRequest, service]);

    const resetPassword = useCallback(async (token: string, newPassword: string) => {
        return executeRequest(
            () => service.resetPassword(token, newPassword),
            (response) => response.data,
            'An error occurred during password reset'
        );
    }, [executeRequest, service]);

    const getProfile = useCallback(async () => {
        return executeRequest(
            () => service.getProfile(),
            (response) => {
                setUser(response.data.data ?? null);
                return response.data;
            },
            'An error occurred while fetching user profile'
        );
    }, [executeRequest, service]);

    const updateProfile = useCallback(
        async (userData: Partial<User>) => {
            return executeRequest(
                () => service.updateProfile(userData),
                (response) => {
                    getProfile();
                    return response.data;
                },
                'An error occurred during profile update'
            );
        },
        [executeRequest, service, getProfile]
    );

    const changePassword = useCallback(async (data: ChangePasswordDto) => {
        return executeRequest(
            () => service.changePassword(data),
            (response) => response.data,
            'An error occurred during password change'
        );
    }, [executeRequest, service]);

    const getAllUsers = useCallback(async () => {
        return executeRequest(
            () => service.getAllUsers(),
            (response) => response.data,
            'An error occurred while fetching users'
        );
    }, [executeRequest, service]);

    const blockUser = useCallback(async (userId: string) => {
        return executeRequest(
            () => service.blockUser(userId),
            (response) => response.data,
            'An error occurred while blocking user'
        );
    }, [executeRequest, service]);

    const setUserRoles = useCallback(async (userId: string, roles: string[]) => {
        return executeRequest(
            () => service.setUserRoles(userId, roles),
            (response) => response.data,
            'An error occurred while setting user roles'
        );
    }, [executeRequest, service]);

    return {
        user,
        loading,
        error,
        clearError,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        getProfile,
        updateProfile,
        changePassword,
        getAllUsers,
        blockUser,
        setUserRoles,
    };
};