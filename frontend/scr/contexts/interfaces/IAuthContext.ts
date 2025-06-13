import { User, RegisterUserDto, LoginCredentials, ChangePasswordDto } from '@cusTypes/auth';

export interface IUserAuthContext {
    user: User | null;
    loading: boolean;
    error: string | null;
    clearError: () => void;
    login: (credentials: LoginCredentials) => Promise<any>;
    logout: () => Promise<any>;
    getProfile: () => Promise<any>;
}

export interface IUserRegistrationContext {
    loading: boolean;
    error: string | null;
    clearError: () => void;
    register: (userData: RegisterUserDto) => Promise<any>;
    forgotPassword: (email: string) => Promise<any>;
    resetPassword: (token: string, newPassword: string) => Promise<any>;
}

export interface IUserManagementContext {
    user: User | null;
    loading: boolean;
    error: string | null;
    clearError: () => void;
    updateProfile: (userData: Partial<User>) => Promise<any>;
    changePassword: (data: ChangePasswordDto) => Promise<any>;
}

export interface IAdminContext {
    loading: boolean;
    error: string | null;
    clearError: () => void;
    getAllUsers: () => Promise<any>;
    blockUser: (userId: string) => Promise<any>;
    setUserRoles: (userId: string, roles: string[]) => Promise<any>;
}

export interface IFullAuthContext extends 
    IUserAuthContext, 
    IUserRegistrationContext, 
    IUserManagementContext, 
    IAdminContext {}

export interface IBaseContext {
    loading: boolean;
    error: string | null;
    clearError: () => void;
}