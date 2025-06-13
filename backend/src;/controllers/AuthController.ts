// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { IAuthService } from '../services/interfaces/IAuthService';
import { IEmailService } from '../services/interfaces/IEmailService';
import { LoginCredentials, PasswordUpdateData, UserCreateData } from '../models/entity/User';

export class AuthController {    
    constructor(private authService: IAuthService) {
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }
    
    async login(req: Request, res: Response): Promise<void> {
        try {
            const credentials: LoginCredentials = {
                username: req.body.username,
                password: req.body.password,
            };

            const user = await this.authService.login(credentials);
            const token = this.authService.generateToken(user);
            res.cookie('token', token, this.authService.getCookieConfig());
            // @ts-ignore
            delete user.id;
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: user,
            });
        } catch (error) {
            res.status(401).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Authentication failed',
            });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie('token');
            res.status(200).json({
                status: 'success',
                message: 'Logout successful',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Logout failed',
            });
        }
    }
}

export class RegistrationController {
    constructor(private authService: IAuthService) {
        this.register = this.register.bind(this);
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const userData: UserCreateData = {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            };

            await this.authService.createAccount(userData);

            res.status(201).json({
                status: 'success',
                message: 'User registered successfully',
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Registration failed',
            });
        }
    }
}

export class PasswordController {
    constructor(
        private authService: IAuthService,
        private emailService: IEmailService
    ) {
        this.updatePassword = this.updatePassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.completePasswordReset = this.completePasswordReset.bind(this);
    }
    
    async updatePassword(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const passwordData: PasswordUpdateData = {
                userId: userId,
                oldPassword: req.body.oldPassword,
                newPassword: req.body.newPassword,
            };

            await this.authService.updatePassword(passwordData);

            res.status(200).json({
                status: 'success',
                message: 'Password updated successfully',
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update password',
            });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const email = req.body.email;
            if (!email) {
                throw new Error('Email not provided');
            }
            
            const token = await this.authService.resetPassword(email);
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
            await this.emailService.sendPasswordResetEmail(email, resetUrl);

            res.status(200).json({
                status: 'success',
                message: 'Password reset email sent successfully',
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to reset password',
            });
        }
    }

    async completePasswordReset(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = req.body;
            
            if (!token || !newPassword) {
                throw new Error('Token and new password are required');
            }

            const success = await this.authService.completePasswordReset(token, newPassword);

            if (success) {
                res.status(200).json({
                    status: 'success',
                    message: 'Password has been reset successfully',
                });
            } else {
                throw new Error('Failed to reset password');
            }
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to reset password',
            });
        }
    }
}