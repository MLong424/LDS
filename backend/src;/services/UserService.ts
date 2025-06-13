// src/services/UserService.ts
import { User, UserUpdateData } from '../models/entity/User';
import { IUserProfileService, IAdminUserService } from './interfaces/IUserService';
import { IUserRepository } from '../models/interfaces/IUserRepository';

export class UserProfileService implements IUserProfileService {
    constructor(private userRepository: IUserRepository) {}

    async updateProfile(id: string, data: UserUpdateData): Promise<void> {
        // Repository now handles validation via factory pattern
        return this.userRepository.updateProfile(id, data);
    }

    async getUserDetailById(id: string): Promise<User> {
        const user = await this.userRepository.getUserDetailById(id);
        return user;
    }
}

export class AdminUserService implements IAdminUserService {
    constructor(private userRepository: IUserRepository) {}

    async getAllUsers(adminId: string): Promise<User[]> {
        // Validate admin permissions at service level
        const admin = await this.userRepository.getUserDetailById(adminId);
        
        if (!admin.hasPermission('user.manage')) {
            throw new Error('Insufficient permissions to view all users');
        }
        
        const users = await this.userRepository.getAllUsers(adminId);
        
        // Add service-level filtering/enhancement
        return users.filter(user => {
            // Super admins can see all users, regular admins can't see other admins
            if (admin.getUserType() === 'ADMIN' && user.getUserType() === 'ADMIN') {
                return admin.hasRole('SUPER_ADMIN') || user.id === adminId;
            }
            return true;
        });
    }

    async blockOrUnblockUser(adminId: string, userId: string): Promise<void> {
        // Repository handles the actual operation with validation
        return this.userRepository.blockOrUnblockUser(adminId, userId);
    }

    async setUserRoles(userId: string, roles: string[], adminId: string): Promise<void> {
        // Repository handles validation and persistence
        return this.userRepository.setUserRoles(userId, roles, adminId);
    }
}

// Combined service for backward compatibility
export class UserService implements IUserProfileService, IAdminUserService {
    private profileService: UserProfileService;
    private adminService: AdminUserService;

    constructor(userRepository: IUserRepository) {
        this.profileService = new UserProfileService(userRepository);
        this.adminService = new AdminUserService(userRepository);
    }

    // Profile methods - now leverage enhanced user objects
    async updateProfile(id: string, data: UserUpdateData): Promise<void> {
        return this.profileService.updateProfile(id, data);
    }

    async getUserDetailById(id: string): Promise<User> {
        return this.profileService.getUserDetailById(id);
    }

    // Admin methods - now with enhanced business logic
    async getAllUsers(adminId: string): Promise<User[]> {
        return this.adminService.getAllUsers(adminId);
    }

    async blockOrUnblockUser(adminId: string, userId: string): Promise<void> {
        return this.adminService.blockOrUnblockUser(adminId, userId);
    }

    async setUserRoles(userId: string, roles: string[], adminId: string): Promise<void> {
        return this.adminService.setUserRoles(userId, roles, adminId);
    }

    // Additional service methods leveraging new user capabilities
    async getUsersByType(adminId: string, userType: string): Promise<User[]> {
        const users = await this.getAllUsers(adminId);
        return users.filter(user => user.getUserType() === userType.toUpperCase());
    }

    async getActiveUsers(adminId: string): Promise<User[]> {
        const users = await this.getAllUsers(adminId);
        return users.filter(user => user.isActive());
    }

    async getUsersWithPermission(adminId: string, permission: string): Promise<User[]> {
        const users = await this.getAllUsers(adminId);
        return users.filter(user => user.hasPermission(permission));
    }
}