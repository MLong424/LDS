// src/services/interfaces/IUserService.ts
import { User, UserUpdateData } from '../../models/entity/User';

// Basic user profile operations
export interface IUserProfileService {
    updateProfile(id: string, data: UserUpdateData): Promise<void>;
    getUserDetailById(id: string): Promise<User>;
}

// Admin user management operations
export interface IAdminUserService {
    getAllUsers(adminId: string): Promise<User[]>;
    blockOrUnblockUser(adminId: string, userId: string): Promise<void>;
    setUserRoles(userId: string, roles: string[], adminId: string): Promise<void>;
}

// For backward compatibility - combines all interfaces
export interface IUserService extends IUserProfileService, IAdminUserService {}