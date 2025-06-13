// src/routes/userRoutes.ts
import express from 'express';
import authMiddleware from '../middlewares/auth';
import { UserController } from '../controllers/UserController';
import { IUserService } from '../services/interfaces/IUserService';

export function createUserRoutes(userService: IUserService) {
    const router = express.Router();
    const userController = new UserController(userService, userService);

    // Protected routes (require authentication)
    router.get('/profile', authMiddleware, userController.getUserById);
    router.put('/profile', authMiddleware, userController.updateProfile);

    // Admin routes (require admin role)
    router.get('/all', authMiddleware, userController.getAllUsers);
    router.post('/block/:id', authMiddleware, userController.blockOrUnblockUser);
    router.post('/roles/:id', authMiddleware, userController.setUserRoles);

    return router;
}