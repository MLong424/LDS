// src/models/factory/UserFactory.ts
import { User, AdminUser, CustomerUser, ProductManagerUser } from '../entity/User';
// Factory for creating different user types
export class UserFactory {
    public static createUser(userType: string, data: any): User {
        switch (userType.toUpperCase()) {
            case 'CUSTOMER':
                return this.createCustomerUser(data);
            case 'PRODUCT_MANAGER':
                return this.createProductManagerUser(data);
            case 'ADMIN':
                return this.createAdminUser(data);
            default:
                return this.createCustomerUser(data); // Default to customer
        }
    }

    public static createUserFromRoles(roles: string[], data: any): User {
        if (roles.includes('ADMIN')) {
            return this.createAdminUser(data);
        } else if (roles.includes('PRODUCT_MANAGER')) {
            return this.createProductManagerUser(data);
        } else {
            return this.createCustomerUser(data);
        }
    }

    private static createCustomerUser(data: any): CustomerUser {
        const user = new CustomerUser();
        this.populateBaseUser(user, data);
        return user;
    }

    private static createProductManagerUser(data: any): ProductManagerUser {
        const user = new ProductManagerUser();
        this.populateBaseUser(user, data);
        return user;
    }

    private static createAdminUser(data: any): AdminUser {
        const user = new AdminUser();
        this.populateBaseUser(user, data);
        return user;
    }

    private static populateBaseUser(user: User, data: any): void {
        user.id = data.id;
        user.username = data.username;
        user.password = data.password;
        user.email = data.email;
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.phone = data.phone;
        user.address = data.address;
        user.image = data.image;
        user.roles = data.roles || [];
        user.createdAt = data.createdAt || new Date();
        user.updatedAt = data.updatedAt || new Date();
        user.active = data.active !== undefined ? data.active : true;
    }

    public static validateUserData(userType: string, data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Basic validation
        if (!data.username) errors.push('Username is required');
        if (!data.email) errors.push('Email is required');
        if (!data.firstName) errors.push('First name is required');
        if (!data.lastName) errors.push('Last name is required');

        // Type-specific validation
        switch (userType.toUpperCase()) {
            case 'PRODUCT_MANAGER':
                break;
            case 'ADMIN':
                break;
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}