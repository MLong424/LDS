import { AxiosInstance, AxiosResponse } from 'axios';
import { RegisterUserDto, LoginCredentials, User, ChangePasswordDto } from '@cusTypes/auth';
import { ApiResponse } from '@cusTypes/common';
import { IAuthService } from '../interfaces/IApiService';

export default class AuthServiceImpl implements IAuthService {
    constructor(private apiClient: AxiosInstance) {}

    register(userData: RegisterUserDto): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.post<ApiResponse>('/auth/register', userData);
    }

    login(credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.post<ApiResponse>('/auth/login', credentials);
    }

    logout(): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.get<ApiResponse>('/auth/logout');
    }

    forgotPassword(email: string): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    }

    resetPassword(token: string, newPassword: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return this.apiClient.post<ApiResponse<void>>('/auth/reset-password', {
            token,
            newPassword,
        });
    }

    getProfile(): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.apiClient.get<ApiResponse<User>>('/users/profile');
    }

    updateProfile(userData: Partial<User>): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.put<ApiResponse>('/users/profile', userData);
    }

    changePassword(data: ChangePasswordDto): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.put<ApiResponse>('/auth/password', data);
    }

    getAllUsers(): Promise<AxiosResponse<ApiResponse<User[]>>> {
        return this.apiClient.get<ApiResponse<User[]>>('/users/all');
    }

    blockUser(userId: string): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.post<ApiResponse>(`/users/block/${userId}`);
    }

    setUserRoles(userId: string, roles: string[]): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.post<ApiResponse>(`/users/roles/${userId}`, { roles });
    }
}