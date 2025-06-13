import { ApiServiceFactory } from './factory/ApiServiceFactory';
import { axiosInstance } from './config';

// Legacy imports for backward compatibility
import authService from './services/authService';
import productService from './services/productService';
import cartService from './services/cartService';
import orderService from './services/orderService';
import paymentService from './services/paymentService';

// New factory-based service creation
const serviceFactory = ApiServiceFactory.getInstance();

const apiService = {
    auth: serviceFactory.createAuthService(),
    products: serviceFactory.createProductService(),
    cart: serviceFactory.createCartService(),
    orders: serviceFactory.createOrderService(),
    payments: serviceFactory.createPaymentService(),
};

export default apiService;

// Export factory for advanced usage
export { ApiServiceFactory, serviceFactory };

// Export interfaces
export * from './interfaces/IApiService';

// Legacy exports for backward compatibility
export { 
    axiosInstance, 
    authService, 
    productService, 
    cartService, 
    orderService, 
    paymentService 
};
