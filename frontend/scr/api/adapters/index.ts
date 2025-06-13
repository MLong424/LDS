export * from './ApiAdapter';
export * from './AuthResponseAdapter';
export * from './ProductResponseAdapter';

import { AuthResponseAdapter, AuthListResponseAdapter, AuthMessageResponseAdapter } from './AuthResponseAdapter';
import { ProductResponseAdapter, ProductListResponseAdapter, ProductCreationResponseAdapter } from './ProductResponseAdapter';

export const Adapters = {
    Auth: {
        User: new AuthResponseAdapter(),
        UserList: new AuthListResponseAdapter(),
        Message: new AuthMessageResponseAdapter(),
    },
    Product: {
        Single: new ProductResponseAdapter(),
        List: new ProductListResponseAdapter(),
        Creation: new ProductCreationResponseAdapter(),
    },
};