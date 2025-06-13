// src/controllers/UserController.ts
import { Request, Response } from 'express';
import { UserUpdateData } from '../models/entity/User';
import { IUserProfileService, IAdminUserService } from '../services/interfaces/IUserService';

export class UserProfileController {
    constructor(private userProfileService: IUserProfileService) {
        this.updateProfile = this.updateProfile.bind(this);
        this.getUserById = this.getUserById.bind(this);
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }
            const profileData: UserUpdateData = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            };

            await this.userProfileService.updateProfile(userId, profileData);

            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Profile update failed',
            });
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }
            const user = await this.userProfileService.getUserDetailById(userId);

            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            res.status(200).json({
                status: 'success',
                data: userWithoutPassword,
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'User not found',
            });
        }
    }
}

export class AdminUserController {
    constructor(private adminUserService: IAdminUserService) {
        this.getAllUsers = this.getAllUsers.bind(this);
        this.blockOrUnblockUser = this.blockOrUnblockUser.bind(this);
        this.setUserRoles = this.setUserRoles.bind(this);
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }
            const users = await this.adminUserService.getAllUsers(userId);

            // Remove passwords from response
            const usersWithoutPasswords = users.map((user) => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

            res.status(200).json({
                status: 'success',
                data: usersWithoutPasswords,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to retrieve users',
            });
        }
    }

    async blockOrUnblockUser(req: Request, res: Response): Promise<void> {
        try {
            const adminId = req.user?.id;
            if (!adminId) {
                throw new Error('Admin ID not found in request');
            }
            const userId = req.params?.id;
            if (!userId) {
                throw new Error('User ID not found in request parameters');
            }

            await this.adminUserService.blockOrUnblockUser(adminId, userId);

            res.status(200).json({
                status: 'success',
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to block user',
            });
        }
    }

    async setUserRoles(req: Request, res: Response): Promise<void> {
        try {
            const adminId = req.user?.id;
            if (!adminId) {
                throw new Error('Admin ID not found in request');
            }
            const userId = req.params?.id;
            if (!userId) {
                throw new Error('User ID not found in request parameters');
            }
            const roles: string[] = req.body.roles;

            await this.adminUserService.setUserRoles(userId, roles, adminId);

            res.status(200).json({
                status: 'success',
                message: 'User roles updated successfully',
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update user roles',
            });
        }
    }
}

// Combined controller for backward compatibility
export class UserController {
    private profileController: UserProfileController;
    private adminController: AdminUserController;

    constructor(userProfileService: IUserProfileService, adminUserService: IAdminUserService) {
        this.profileController = new UserProfileController(userProfileService);
        this.adminController = new AdminUserController(adminUserService);

        // Bind all methods
        this.updateProfile = this.profileController.updateProfile;
        this.getUserById = this.profileController.getUserById;
        this.getAllUsers = this.adminController.getAllUsers;
        this.blockOrUnblockUser = this.adminController.blockOrUnblockUser;
        this.setUserRoles = this.adminController.setUserRoles;
    }

    updateProfile: UserProfileController['updateProfile'];
    getUserById: UserProfileController['getUserById'];
    getAllUsers: AdminUserController['getAllUsers'];
    blockOrUnblockUser: AdminUserController['blockOrUnblockUser'];
    setUserRoles: AdminUserController['setUserRoles'];
}
