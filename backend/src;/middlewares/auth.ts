// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                roles: string[];
            };
        }
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies or headers
        const authHeader = req.cookies.token;
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'Authenticated user required',
            });
        }
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as {
            id: string;
            username: string;
            roles: string[];
        };

        // Attach user to request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            roles: decoded.roles,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token',
        });
    }
};

export default authMiddleware;
