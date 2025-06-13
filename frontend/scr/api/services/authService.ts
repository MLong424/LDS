// src/api/services/authService.ts
import { axiosInstance } from '../config';
import { RegisterUserDto, LoginCredentials, User, ChangePasswordDto } from '@cusTypes/auth';
import { ApiResponse } from '@cusTypes/common';

const authService = {
    register: (userData: RegisterUserDto) => axiosInstance.post<ApiResponse>('/auth/register', userData),

    login: (credentials: LoginCredentials) => axiosInstance.post<ApiResponse>('/auth/login', credentials),

    logout: () => axiosInstance.get<ApiResponse>('/auth/logout'),

    forgotPassword: (email: string) => axiosInstance.post<ApiResponse>('/auth/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
        axiosInstance.post<ApiResponse<void>>('/auth/reset-password', {
            token,
            newPassword,
        }),

    getProfile: () => axiosInstance.get<ApiResponse<User>>('/users/profile'),

    updateProfile: (userData: Partial<User>) => axiosInstance.put<ApiResponse>('/users/profile', userData),

    changePassword: (data: ChangePasswordDto) => axiosInstance.put<ApiResponse>('/auth/password', data),

    // Admin functions
    getAllUsers: () => axiosInstance.get<ApiResponse<User[]>>('/users/all'),

    blockUser: (userId: string) => axiosInstance.post<ApiResponse>(`/users/block/${userId}`),

    setUserRoles: (userId: string, roles: string[]) =>
        axiosInstance.post<ApiResponse>(`/users/roles/${userId}`, { roles }),
};

export default authService;
