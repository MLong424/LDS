// src/models/interfaces/IUserRepository.ts
import { User, UserCreateData, UserUpdateData, LoginCredentials, PasswordUpdateData } from '../entity/User';

export interface IUserRepository {
    updateProfile(id: string, data: UserUpdateData): Promise<void>;
    getUserDetailById(id: string): Promise<User>;
    getAllUsers(id: string): Promise<User[]>;
    blockOrUnblockUser(adminId: string, userId: string): Promise<void>;
    setUserRoles(userId: string, roles: string[], adminId: string): Promise<void>;
}

export interface IAuthRepository {
    createAccount(data: UserCreateData): Promise<boolean>;
    signIn(credentials: LoginCredentials): Promise<User>;
    updatePassword(data: PasswordUpdateData): Promise<void>;
    resetPassword(email: string): Promise<string>;
    completePasswordReset(token: string, newPassword: string): Promise<boolean>;
}