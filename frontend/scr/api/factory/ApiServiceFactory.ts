import { AxiosInstance } from 'axios';
import { ApiClient } from '../config';
import {
    IApiServiceFactory,
    IAuthService,
    IProductService,
    ICartService,
    IOrderService,
    IPaymentService,
} from '../interfaces/IApiService';

import AuthServiceImpl from '../services/AuthServiceImpl';
import ProductServiceImpl from '../services/ProductServiceImpl';
import CartServiceImpl from '../services/CartServiceImpl';
import OrderServiceImpl from '../services/OrderServiceImpl';
import PaymentServiceImpl from '../services/PaymentServiceImpl';

export class ApiServiceFactory implements IApiServiceFactory {
    private static instance: ApiServiceFactory;
    private apiClient: AxiosInstance;

    private authService?: IAuthService;
    private productService?: IProductService;
    private cartService?: ICartService;
    private orderService?: IOrderService;
    private paymentService?: IPaymentService;

    private constructor() {
        this.apiClient = ApiClient.getInstance().getAxiosInstance();
    }

    public static getInstance(): ApiServiceFactory {
        if (!ApiServiceFactory.instance) {
            ApiServiceFactory.instance = new ApiServiceFactory();
        }
        return ApiServiceFactory.instance;
    }

    createAuthService(): IAuthService {
        if (!this.authService) {
            this.authService = new AuthServiceImpl(this.apiClient);
        }
        return this.authService;
    }

    createProductService(): IProductService {
        if (!this.productService) {
            this.productService = new ProductServiceImpl(this.apiClient);
        }
        return this.productService;
    }

    createCartService(): ICartService {
        if (!this.cartService) {
            this.cartService = new CartServiceImpl(this.apiClient);
        }
        return this.cartService;
    }

    createOrderService(): IOrderService {
        if (!this.orderService) {
            this.orderService = new OrderServiceImpl(this.apiClient);
        }
        return this.orderService;
    }

    createPaymentService(): IPaymentService {
        if (!this.paymentService) {
            this.paymentService = new PaymentServiceImpl(this.apiClient);
        }
        return this.paymentService;
    }

    getAllServices() {
        return {
            auth: this.createAuthService(),
            products: this.createProductService(),
            cart: this.createCartService(),
            orders: this.createOrderService(),
            payments: this.createPaymentService(),
        };
    }
}