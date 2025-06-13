// src/services/interfaces/IAuthService.ts
import { User, LoginCredentials, PasswordUpdateData, UserCreateData } from '../../models/entity/User';
export interface TokenPayload {
    id: string;
    username: string;
    roles: string[];
    isActive: boolean;
}

export interface IAuthService {
    generateToken(user: User): string;
    verifyToken(token: string): TokenPayload | null;
    getCookieConfig(secure?: boolean): {
        httpOnly: boolean;
        secure: boolean;
        maxAge: number;
        sameSite: boolean | 'none' | 'lax' | 'strict';
    };
    createAccount(data: UserCreateData): Promise<boolean>;
    login(credentials: LoginCredentials): Promise<User>;
    updatePassword(data: PasswordUpdateData): Promise<void>;
    resetPassword(email: string): Promise<string>;
    completePasswordReset(token: string, newPassword: string): Promise<boolean>;
}
