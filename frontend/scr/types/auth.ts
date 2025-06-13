// src/types/auth.ts
export type User = {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: UserRole[];
    createdAt: string;
    updatedAt: string;
    active: boolean;
    phone?: string;
    address?: string;
    isBlocked?: boolean;
};

export type UserRole = 'ADMIN' | 'PRODUCT_MANAGER' | 'CUSTOMER';

export type RegisterUserDto = {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
};

export type LoginCredentials = {
    username: string;
    password: string;
};

export type ResetPasswordDto = {
    token: string;
    newPassword: string;
};

export type ChangePasswordDto = {
    oldPassword: string;
    newPassword: string;
};
