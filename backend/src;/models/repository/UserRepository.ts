// src/models/repository/UserRepository.ts
import { IDatabaseConnection } from '../../config/interfaces';
import { IAuthRepository, IUserRepository } from '../interfaces/IUserRepository';
import { User, UserCreateData, UserUpdateData, LoginCredentials, PasswordUpdateData } from '../entity/User';
import { UserFactory } from '../factory/UserFactory';

class UserRepository implements IUserRepository {
    private db: IDatabaseConnection;
    constructor(db: IDatabaseConnection) {
        this.db = db;
    }

    /**
     * Update user profile using Factory Pattern for validation
     * @param id User ID
     * @param data User update data
     */
    async updateProfile(id: string, data: UserUpdateData): Promise<void> {
        try {
            const sqlQuery = 'select update_user($1, $2, $3, $4)';
            const values = [
                id,
                data.email,
                data.firstName,
                data.lastName
            ];
            await this.db.query<void>(sqlQuery, values);
        } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get user details by ID using Factory Pattern
     * @param id User ID
     * @returns User data
     */
    async getUserDetailById(id: string): Promise<User> {
        try {
            const result = await this.db.query<any>('select * from user_view_profile($1)', [id]);
            if (result.length === 0) {
                throw new Error(`User with ID ${id} not found`);
            }
            
            const userData = result[0];
            
            // Use factory to create appropriate user type
            const user = this.createUserFromDatabaseData(userData);
            
            return user;
        } catch (error) {
            throw new Error(`Failed to get user details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all users using Factory Pattern
     * @returns Array of all users
     */
    async getAllUsers(adminId: string): Promise<User[]> {
        try {
            const results = await this.db.query<any>('select * from admin_view_all_users($1)', [adminId]);
            
            // Create user instances using factory
            return results.map(userData => this.createUserFromDatabaseData(userData));
        } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Block/Unblock a user with validation
     * @param adminId Admin ID
     * @param userId User ID to block/unblock
     * @returns True if successful
     */
    async blockOrUnblockUser(adminId: string, userId: string): Promise<void> {
        try {
            await this.db.query<void>('select admin_toggle_user_block($1, $2)', [userId, adminId]);
        } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Set or change user roles with validation using Factory Pattern
     * @param userId User ID
     * @param roles Array of role names
     * @param adminId Admin ID
     */
    async setUserRoles(userId: string, roles: string[], adminId: string): Promise<void> {
        try {
            await this.db.query<void>('select admin_set_user_roles($1, $2, $3)', [userId, roles, adminId]);
        } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create user instance from database data using Factory Pattern
     */
    private createUserFromDatabaseData(userData: any): User {
        // Map database field names to entity field names
        const mappedData = {
            id: userData.user_id || userData.id,
            username: userData.username,
            password: userData.password, // Will be excluded in toJSON
            email: userData.email,
            firstName: userData.first_name || userData.firstName,
            lastName: userData.last_name || userData.lastName,
            phone: userData.phone,
            address: userData.address,
            image: userData.image,
            roles: userData.roles || [],
            createdAt: userData.created_at || userData.createdAt,
            updatedAt: userData.updated_at || userData.updatedAt,
            active: userData.active !== undefined ? userData.active : true,
            
            // Type-specific fields
            preferences: userData.preferences,
            loyalty_points: userData.loyalty_points,
            membership_tier: userData.membership_tier,
            department: userData.department,
            manager_level: userData.manager_level,
            specializations: userData.specializations,
            access_level: userData.access_level,
            last_login: userData.last_login,
            security_clearance: userData.security_clearance
        };

        // Use factory to create appropriate user type
        return UserFactory.createUserFromRoles(mappedData.roles, mappedData);
    }

    /**
     * Determine user type from roles
     */
    private determineUserType(roles: string[]): string {
        if (roles.includes('ADMIN')) {
            return 'ADMIN';
        } else if (roles.includes('PRODUCT_MANAGER')) {
            return 'PRODUCT_MANAGER';
        } else {
            return 'CUSTOMER';
        }
    }
}

class AuthRepository implements IAuthRepository {
    private db: IDatabaseConnection;
    constructor(db: IDatabaseConnection) {
        this.db = db;
    }

    /**
     * Create a new user account using Factory Pattern validation
     * @param data User creation data
     * @returns True if account creation successful
     */
    async createAccount(data: UserCreateData): Promise<boolean> {
        try {
            // Ensure password is a string
            if (typeof data.password !== 'string') {
                throw new Error('Password must be a string');
            }

            // Determine user type from roles
            const roles = data.roles || ['CUSTOMER'];
            const userType = this.determineUserType(roles);

            // Validate user data using factory
            const validation = UserFactory.validateUserData(userType, { ...data, roles });
            if (!validation.isValid) {
                throw new Error(`User validation failed: ${validation.errors.join(', ')}`);
            }

            // Create user instance to validate business rules
            const user = UserFactory.createUserFromRoles(roles, { ...data, roles });
            
            // Validate password strength
            const passwordValidation = user.validatePassword(data.password);
            if (!passwordValidation.isValid) {
                throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
            }

            // Validate the complete user
            const userValidation = user.validateUser();
            if (!userValidation.isValid) {
                throw new Error(`User validation failed: ${userValidation.errors.join(', ')}`);
            }

            const sqlQuery = 'SELECT register_user($1, $2, $3, $4, $5) as user';
            const values = [data.username, data.password, data.email, data.firstName, data.lastName];
            await this.db.query<{ user: User }>(sqlQuery, values);
            return true;
        } catch (error) {
            console.error('Error creating account:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Authenticate user with username and password using Factory Pattern
     * @param credentials User login credentials
     * @returns User data if authentication successful
     */
    async signIn(credentials: LoginCredentials): Promise<User> {
        try {
            // Ensure password is a string
            if (typeof credentials.password !== 'string') {
                throw new Error('Password must be a string');
            }

            const result = await this.db.query<any>('select * from user_login($1, $2)', [
                credentials.username,
                credentials.password,
            ]);
            
            if (result.length === 0) {
                throw new Error('Invalid username or password');
            }

            const userData = result[0];
            
            // Create user instance using factory
            const user = this.createUserFromDatabaseData(userData);
            
            // Validate user is active
            if (!user.isActive()) {
                throw new Error('User account is inactive');
            }

            return user;
        } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update user password with validation using Factory Pattern
     * @param data Password update data
     */
    async updatePassword(data: PasswordUpdateData): Promise<void> {
        try {
            // Ensure passwords are strings
            if (typeof data.oldPassword !== 'string' || typeof data.newPassword !== 'string') {
                throw new Error('Passwords must be strings');
            }

            // Get user to validate password requirements
            const user = await this.getUserById(data.userId);
            
            // Validate new password strength using user instance
            const passwordValidation = user.validatePassword(data.newPassword);
            if (!passwordValidation.isValid) {
                throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
            }

            const sqlQuery = 'SELECT user_change_password($1, $2, $3)';
            const values = [data.userId, data.oldPassword, data.newPassword];
            await this.db.query<void>(sqlQuery, values);
        } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Reset user password for forgotten password
     * @param email User email
     * @returns Temporary password or confirmation token
     */
    async resetPassword(email: string): Promise<string> {
        try {
            const result = await this.db.query<{ token: string }>('select request_password_reset($1) as token', [email]);
            return result[0].token;
        } catch (error) {
            throw new Error(`Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Complete password reset with token and new password using Factory Pattern validation
     * @param token Reset token from email
     * @param newPassword New password
     * @returns True if password reset successful
     */
    async completePasswordReset(token: string, newPassword: string): Promise<boolean> {
        try {
            // First validate the new password meets minimum requirements
            // We'll use a default customer user for basic validation
            const tempUser = UserFactory.createUser('CUSTOMER', {
                username: 'temp',
                email: 'temp@example.com',
                firstName: 'Temp',
                lastName: 'User',
                roles: ['CUSTOMER']
            });

            const passwordValidation = tempUser.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
            }

            const result = await this.db.query<{ complete_password_reset: boolean }>(
                'select complete_password_reset($1, $2) as complete_password_reset', 
                [token, newPassword]
            );
            return result[0].complete_password_reset;
        } catch (error) {
            throw new Error(`Failed to complete password reset: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get user by ID (helper method)
     */
    private async getUserById(id: string): Promise<User> {
        const result = await this.db.query<any>('select * from user_view_profile($1)', [id]);
        if (result.length === 0) {
            throw new Error(`User with ID ${id} not found`);
        }
        
        return this.createUserFromDatabaseData(result[0]);
    }

    /**
     * Create user instance from database data using Factory Pattern
     */
    private createUserFromDatabaseData(userData: any): User {
        // Map database field names to entity field names
        const mappedData = {
            id: userData.user_id || userData.id,
            username: userData.username,
            password: userData.password,
            email: userData.email,
            firstName: userData.first_name || userData.firstName,
            lastName: userData.last_name || userData.lastName,
            phone: userData.phone,
            address: userData.address,
            image: userData.image,
            roles: userData.roles || [],
            createdAt: userData.created_at || userData.createdAt,
            updatedAt: userData.updated_at || userData.updatedAt,
            active: userData.active !== undefined ? userData.active : true,
            
            // Type-specific fields
            preferences: userData.preferences,
            loyalty_points: userData.loyalty_points,
            membership_tier: userData.membership_tier,
            department: userData.department,
            manager_level: userData.manager_level,
            specializations: userData.specializations,
            access_level: userData.access_level,
            last_login: userData.last_login,
            security_clearance: userData.security_clearance
        };

        // Use factory to create appropriate user type
        return UserFactory.createUserFromRoles(mappedData.roles, mappedData);
    }

    /**
     * Determine user type from roles
     */
    private determineUserType(roles: string[]): string {
        if (roles.includes('ADMIN')) {
            return 'ADMIN';
        } else if (roles.includes('PRODUCT_MANAGER')) {
            return 'PRODUCT_MANAGER';
        } else {
            return 'CUSTOMER';
        }
    }
}

export { UserRepository, AuthRepository };