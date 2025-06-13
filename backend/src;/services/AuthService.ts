// src/services/AuthService.ts
import jwt from 'jsonwebtoken';
import { LoginCredentials, PasswordUpdateData, User, UserCreateData } from '../models/entity/User';
import { TokenPayload, IAuthService } from './interfaces/IAuthService';
import { AuthRepository } from '../models/repository/UserRepository';

export class AuthService implements IAuthService {
    private readonly JWT_SECRET: string = process.env.JWT_SECRET ?? 'your_jwt_secret_key';
    private readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN ?? '24h';
    private readonly COOKIE_MAX_AGE: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    constructor(private authRepository: AuthRepository) {}

    /**
     * Generate a JWT token for authenticated user - now leverages user type
     * @param user User object
     * @returns JWT token
     */
    generateToken(user: User): string {
        const payload: TokenPayload = {
            id: user.id,
            username: user.username,
            roles: user.roles || [],
            isActive: user.isActive(),
        };
        // @ts-ignore
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        });
    }

    /**
     * Verify and decode a JWT token
     * @param token JWT token
     * @returns Decoded token payload or null if invalid
     */
    verifyToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as any;
            
            // Validate token has required fields
            if (!decoded.id || !decoded.username || !decoded.roles) {
                return null;
            }

            return {
                id: decoded.id,
                username: decoded.username,
                roles: decoded.roles,
                isActive: decoded.isActive !== undefined ? decoded.isActive : true, // Default to true
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Get cookie configuration for storing JWT
     */
    getCookieConfig(): {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        maxAge: number;
        domain?: string;
        path: string;
    } {
        const isProduction = process.env.NODE_ENV === 'production';
        
        const config: {
            httpOnly: boolean;
            secure: boolean;
            sameSite: 'strict' | 'lax' | 'none';
            maxAge: number;
            domain?: string;
            path: string;
        } = {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: this.COOKIE_MAX_AGE,
            path: '/',
        };

        if (isProduction && process.env.FRONTEND_URL?.startsWith('https')) {
            config.secure = true;
            config.sameSite = 'strict';
        }

        return config;
    }

    /**
     * Generate refresh token
     * @param userId User ID
     * @returns Refresh token
     */
    generateRefreshToken(userId: string): string {
        return jwt.sign({ id: userId }, this.JWT_SECRET, {
            expiresIn: '7d',
        });
    }

    async createAccount(data: UserCreateData): Promise<boolean> {
        // Repository now handles validation via UserFactory
        return this.authRepository.createAccount(data);
    }

    async login(credentials: LoginCredentials): Promise<User> {
        const user = await this.authRepository.signIn(credentials);        
        return user;
    }

    async updatePassword(data: PasswordUpdateData): Promise<void> {
        // Repository now handles password validation via UserFactory
        return this.authRepository.updatePassword(data);
    }

    async resetPassword(email: string): Promise<string> {
        return this.authRepository.resetPassword(email);
    }

    async completePasswordReset(token: string, newPassword: string): Promise<boolean> {
        // Repository now handles password validation via UserFactory
        return this.authRepository.completePasswordReset(token, newPassword);
    }
}