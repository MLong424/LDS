// src/models/entity/User.ts

// Base User class using Template Method Pattern
export abstract class User {
    id!: string;
    username!: string;
    password?: string; // Optional in responses
    email!: string;
    firstName!: string;
    lastName!: string;
    phone?: string;
    address?: string;
    image?: string;
    roles!: string[];
    createdAt!: Date;
    updatedAt!: Date;
    active!: boolean; // For blocking/unblocking users

    /**
     * Template method for user validation
     * This method defines the structure for user validation
     */
    public validateUser(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.validateBasicInfo()) {
            errors.push('Basic user information is incomplete');
        }

        if (!this.validateEmailFormat()) {
            errors.push('Email format is invalid');
        }

        if (!this.validateRoles()) {
            errors.push('User roles are invalid');
        }

        const customValidation = this.performCustomValidation();
        if (!customValidation.isValid) {
            errors.push(...customValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Template method for permission checking
     * This method defines the structure for permission validation
     */
    public hasPermission(permission: string): boolean {
        if (!this.isActive()) {
            return false;
        }

        const rolePermissions = this.getRolePermissions();
        const userPermissions = this.getUserSpecificPermissions();
        
        return this.checkPermissionInRoles(permission, rolePermissions) || 
               this.checkUserSpecificPermission(permission, userPermissions);
    }

    /**
     * Template method for role management
     * This method defines the structure for role operations
     */
    public canAssignRole(role: string): { canAssign: boolean; reason?: string } {
        if (!this.isActive()) {
            return { canAssign: false, reason: 'User account is inactive' };
        }

        if (!this.isValidRole(role)) {
            return { canAssign: false, reason: `Invalid role: ${role}` };
        }

        const customValidation = this.validateCustomRoleAssignment(role);
        if (!customValidation.canAssign) {
            return customValidation;
        }

        return { canAssign: true };
    }

    /**
     * Template method for user display information
     */
    public getUserDisplayInfo(): string {
        const basicInfo = this.getBasicDisplayInfo();
        const roleInfo = this.getRoleDisplayInfo();
        const statusInfo = this.getStatusDisplayInfo();
        
        return this.formatUserDisplayInfo(basicInfo, roleInfo, statusInfo);
    }

    /**
     * Template method for password validation
     */
    public validatePassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.checkPasswordLength(password)) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!this.checkPasswordComplexity(password)) {
            errors.push('Password must contain uppercase, lowercase, and numeric characters');
        }

        const customValidation = this.performCustomPasswordValidation(password);
        if (!customValidation.isValid) {
            errors.push(...customValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Common methods that can be overridden by subclasses
    protected validateBasicInfo(): boolean {
        return !!(
            this.username &&
            this.email &&
            this.firstName &&
            this.lastName
        );
    }

    protected validateEmailFormat(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    protected validateRoles(): boolean {
        return Array.isArray(this.roles) && this.roles.length > 0;
    }

    protected isValidRole(role: string): boolean {
        const validRoles = ['CUSTOMER', 'PRODUCT_MANAGER', 'ADMIN'];
        return validRoles.includes(role);
    }

    protected checkPasswordLength(password: string): boolean {
        return password.length >= 8;
    }

    protected checkPasswordComplexity(password: string): boolean {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumeric = /\d/.test(password);
        return hasUppercase && hasLowercase && hasNumeric;
    }

    protected getBasicDisplayInfo(): string {
        return `${this.firstName} ${this.lastName} (${this.username})`;
    }

    protected getRoleDisplayInfo(): string {
        return `Roles: ${this.roles.join(', ')}`;
    }

    protected getStatusDisplayInfo(): string {
        return `Status: ${this.active ? 'Active' : 'Inactive'}`;
    }

    protected formatUserDisplayInfo(basicInfo: string, roleInfo: string, statusInfo: string): string {
        return `${basicInfo} | ${roleInfo} | ${statusInfo}`;
    }

    protected getRolePermissions(): string[] {
        // Default role permissions - can be overridden
        const rolePermissionMap: Record<string, string[]> = {
            'ADMIN': ['*'], // All permissions
            'PRODUCT_MANAGER': ['product.create', 'product.update', 'product.view', 'order.manage'],
            'CUSTOMER': ['order.create', 'order.view', 'profile.update']
        };

        const permissions: string[] = [];
        for (const role of this.roles) {
            const rolePerms = rolePermissionMap[role] || [];
            permissions.push(...rolePerms);
        }

        return [...new Set(permissions)]; // Remove duplicates
    }

    protected getUserSpecificPermissions(): string[] {
        // Default implementation returns empty array
        // Subclasses can override for user-specific permissions
        return [];
    }

    protected checkPermissionInRoles(permission: string, rolePermissions: string[]): boolean {
        return rolePermissions.includes('*') || rolePermissions.includes(permission);
    }

    protected checkUserSpecificPermission(permission: string, userPermissions: string[]): boolean {
        return userPermissions.includes(permission);
    }

    // Common utility methods
    public getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public isActive(): boolean {
        return this.active;
    }

    public hasRole(role: string): boolean {
        return this.roles.includes(role);
    }

    public isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }

    public isProductManager(): boolean {
        return this.hasRole('PRODUCT_MANAGER');
    }

    public isCustomer(): boolean {
        return this.hasRole('CUSTOMER');
    }

    public getAge(): number | undefined {
        // This would require a birthdate field
        // Placeholder implementation
        return undefined;
    }

    public addRole(role: string): void {
        if (!this.hasRole(role) && this.isValidRole(role)) {
            this.roles.push(role);
        }
    }

    public removeRole(role: string): void {
        this.roles = this.roles.filter(r => r !== role);
    }

    // Abstract methods that subclasses must implement
    public abstract getUserType(): string;
    protected abstract performCustomValidation(): { isValid: boolean; errors: string[] };
    protected abstract validateCustomRoleAssignment(role: string): { canAssign: boolean; reason?: string };
    protected abstract performCustomPasswordValidation(password: string): { isValid: boolean; errors: string[] };

    // toJSON method to prevent circular references and exclude sensitive data
    public toJSON(): any {
        const userData = {
            id: this.id,
            username: this.username,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            address: this.address,
            image: this.image,
            roles: this.roles,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            active: this.active
        };

        // Never include password in JSON output
        return userData;
    }
}

// Customer user implementation
export class CustomerUser extends User {

    public getUserType(): string {
        return 'CUSTOMER';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Customers must have at least the CUSTOMER role
        if (!this.hasRole('CUSTOMER')) {
            errors.push('Customer users must have CUSTOMER role');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected validateCustomRoleAssignment(role: string): { canAssign: boolean; reason?: string } {
        // Customers can only have CUSTOMER role
        if (role !== 'CUSTOMER') {
            return {
                canAssign: false,
                reason: 'Customer users can only have CUSTOMER role'
            };
        }

        return { canAssign: true };
    }

    protected performCustomPasswordValidation(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Customer passwords have standard requirements
        if (password.includes(this.username)) {
            errors.push('Password cannot contain username');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Product Manager user implementation
export class ProductManagerUser extends User {
    public getUserType(): string {
        return 'PRODUCT_MANAGER';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Product managers must have PRODUCT_MANAGER role
        if (!this.hasRole('PRODUCT_MANAGER')) {
            errors.push('Product manager users must have PRODUCT_MANAGER role');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected validateCustomRoleAssignment(role: string): { canAssign: boolean; reason?: string } {
        // Product managers can have PRODUCT_MANAGER and optionally ADMIN
        const allowedRoles = ['PRODUCT_MANAGER', 'ADMIN'];
        if (!allowedRoles.includes(role)) {
            return {
                canAssign: false,
                reason: 'Product managers can only have PRODUCT_MANAGER or ADMIN roles'
            };
        }

        return { canAssign: true };
    }

    protected performCustomPasswordValidation(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Product managers need stronger passwords
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (!hasSpecialChar) {
            errors.push('Product manager passwords must contain at least one special character');
        }

        if (password.length < 10) {
            errors.push('Product manager passwords must be at least 10 characters long');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected checkPasswordLength(password: string): boolean {
        return password.length >= 10; // Override for stronger requirement
    }

    public canManageProduct(productType: string): boolean {
        if (!this.isActive() || !this.hasRole('PRODUCT_MANAGER')) {
            return false;
        }

        return true;
    }
}

// Admin user implementation
export class AdminUser extends User {
    public getUserType(): string {
        return 'ADMIN';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Admins must have ADMIN role
        if (!this.hasRole('ADMIN')) {
            errors.push('Admin users must have ADMIN role');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected validateCustomRoleAssignment(role: string): { canAssign: boolean; reason?: string } {
        // Admins can have any role
        return { canAssign: true };
    }

    protected performCustomPasswordValidation(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Admins need the strongest passwords
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);

        if (!hasSpecialChar || !hasNumber || !hasUppercase || !hasLowercase) {
            errors.push('Admin passwords must contain uppercase, lowercase, numeric, and special characters');
        }

        if (password.length < 12) {
            errors.push('Admin passwords must be at least 12 characters long');
        }

        // Check for common patterns
        if (/(.)\1{2,}/.test(password)) {
            errors.push('Admin passwords cannot contain repeating characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected checkPasswordLength(password: string): boolean {
        return password.length >= 12; // Override for strongest requirement
    }

    protected getUserSpecificPermissions(): string[] {
        // Admins have additional permissions
        return ['system.configure', 'user.manage', 'data.export', 'logs.view'];
    }

    
}

// Legacy interface types for backward compatibility
export interface UserCreateData {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    image?: string;
    roles?: string[];
}

export interface UserUpdateData {
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface PasswordUpdateData {
    userId: string;
    oldPassword: string;
    newPassword: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}