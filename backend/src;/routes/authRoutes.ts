// src/routes/authRoutes.ts
import express from 'express';
import { AuthController, PasswordController, RegistrationController } from '../controllers/AuthController';
import { IAuthService } from '../services/interfaces/IAuthService';
import { IEmailService } from '../services/interfaces/IEmailService';
import authMiddleware from '../middlewares/auth';

export function createAuthRoutes(authService: IAuthService, emailService: IEmailService) {
    const router = express.Router();
    const authController = new AuthController(authService);
    const passwordController = new PasswordController(authService, emailService);
    const registrationController = new RegistrationController(authService);

    // Public routes
    router.post('/login', authController.login);
    router.post('/register', registrationController.register);
    router.get('/logout', authController.logout);
    router.post('/forgot-password', passwordController.resetPassword);
    router.post('/reset-password', passwordController.completePasswordReset);

    // Protected routes
    router.put('/password', authMiddleware, passwordController.updatePassword);

    return router;
}