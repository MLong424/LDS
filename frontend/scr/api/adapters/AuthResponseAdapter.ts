import { AxiosResponse } from 'axios';
import { BaseResponseAdapter } from './ApiAdapter';
import { User } from '@cusTypes/auth';

export class AuthResponseAdapter extends BaseResponseAdapter<User> {
    adapt(response: AxiosResponse): User {
        const userData = this.extractData<User>(response);
        
        if (!userData) {
            throw new Error('Invalid auth response: missing user data');
        }

        return {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            roles: userData.roles,
            phone: userData.phone,
            address: userData.address,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            active: userData.active,
            isBlocked: userData.isBlocked,
        } as User;
    }
}

export class AuthListResponseAdapter extends BaseResponseAdapter<User[]> {
    adapt(response: AxiosResponse): User[] {
        const users = this.extractData<User[]>(response);
        
        if (!Array.isArray(users)) {
            return [];
        }

        return users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            roles: user.roles,
            phone: user.phone,
            address: user.address,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            active: user.active,
            isBlocked: user.isBlocked,
        }));
    }
}

export class AuthMessageResponseAdapter extends BaseResponseAdapter<{ message: string; success: boolean }> {
    adapt(response: AxiosResponse): { message: string; success: boolean } {
        return {
            message: this.extractMessage(response),
            success: this.isSuccess(response),
        };
    }
}