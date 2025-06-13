import { AxiosResponse } from 'axios';
import { RegisterUserDto, LoginCredentials, User, ChangePasswordDto } from '@cusTypes/auth';
import { Product, ProductSearchParams } from '@cusTypes/products';
import { Cart, CartItem } from '@cusTypes/cart';
import { Order, OrderDto } from '@cusTypes/orders';
import { PaymentDto } from '@cusTypes/payments';
import { ApiResponse } from '@cusTypes/common';

export interface IAuthService {
    register(userData: RegisterUserDto): Promise<AxiosResponse<ApiResponse>>;
    login(credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse>>;
    logout(): Promise<AxiosResponse<ApiResponse>>;
    forgotPassword(email: string): Promise<AxiosResponse<ApiResponse>>;
    resetPassword(token: string, newPassword: string): Promise<AxiosResponse<ApiResponse<void>>>;
    getProfile(): Promise<AxiosResponse<ApiResponse<User>>>;
    updateProfile(userData: Partial<User>): Promise<AxiosResponse<ApiResponse>>;
    changePassword(data: ChangePasswordDto): Promise<AxiosResponse<ApiResponse>>;
    getAllUsers(): Promise<AxiosResponse<ApiResponse<User[]>>>;
    blockUser(userId: string): Promise<AxiosResponse<ApiResponse>>;
    setUserRoles(userId: string, roles: string[]): Promise<AxiosResponse<ApiResponse>>;
}

export interface IProductService {
    // New standardized interface methods
    getAllProducts(filters?: ProductSearchParams): Promise<AxiosResponse<ApiResponse<Product[]>>>;
    getProduct(id: number): Promise<AxiosResponse<ApiResponse<Product>>>;
    createProduct(productData: Partial<Product>): Promise<AxiosResponse<ApiResponse<Product>>>;
    updateProduct(id: number, productData: Partial<Product>): Promise<AxiosResponse<ApiResponse<Product>>>;
    deleteProduct(id: number): Promise<AxiosResponse<ApiResponse>>;
    
    // Legacy service methods for backward compatibility
    getRandomProducts(pageSize?: number): Promise<AxiosResponse<ApiResponse<Product[]>>>;
    searchProducts(params: ProductSearchParams): Promise<AxiosResponse<ApiResponse<{
        products: Product[];
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>>>;
    getProductDetails(id: number): Promise<AxiosResponse<ApiResponse<any>>>;
    checkRushEligibility(id: number): Promise<AxiosResponse<ApiResponse<{
        product_id: number;
        is_eligible: boolean;
    }>>>;
    getProductList(params: any): Promise<AxiosResponse<ApiResponse<{
        products: Product[];
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>>>;
    getPriceHistory(id: number): Promise<AxiosResponse<ApiResponse<any[]>>>;
}

export interface ICartService {
    // New standardized interface methods
    getCart(): Promise<AxiosResponse<ApiResponse<Cart>>>;
    addToCart(productId: number, quantity: number): Promise<AxiosResponse<ApiResponse<CartItem>>>;
    updateCartItem(itemId: number, quantity: number): Promise<AxiosResponse<ApiResponse<CartItem>>>;
    removeFromCart(itemId: number): Promise<AxiosResponse<ApiResponse>>;
    clearCart(): Promise<AxiosResponse<ApiResponse>>;
    
    // Legacy service methods for backward compatibility
    initialize(): Promise<AxiosResponse<ApiResponse<{ session_id: string; cart_type: string }>>>;
    getContents(): Promise<AxiosResponse<ApiResponse<Cart>>>;
    addItem(productId: number, quantity: number): Promise<AxiosResponse<ApiResponse<Cart>>>;
    updateItemQuantity(productId: number, quantity: number): Promise<AxiosResponse<ApiResponse<Cart>>>;
    removeItem(productId: number): Promise<AxiosResponse<ApiResponse<Cart>>>;
    validateCart(): Promise<AxiosResponse<ApiResponse<any>>>;
    calculateDeliveryFees(deliveryInfo: any): Promise<AxiosResponse<ApiResponse<any>>>;
}

export interface IOrderService {
    // New standardized interface methods
    getOrders(): Promise<AxiosResponse<ApiResponse<Order[]>>>;
    getOrder(id: string): Promise<AxiosResponse<ApiResponse<Order>>>;
    createOrder(orderData: OrderDto): Promise<AxiosResponse<ApiResponse<Order>>>;
    updateOrderStatus(orderId: string, status: string): Promise<AxiosResponse<ApiResponse<Order>>>;
    cancelOrder(orderId: string): Promise<AxiosResponse<ApiResponse>>;
    getPendingOrders(): Promise<AxiosResponse<ApiResponse<Order[]>>>;
    approveOrder(orderId: string): Promise<AxiosResponse<ApiResponse<Order>>>;
    rejectOrder(orderId: string, reason?: string): Promise<AxiosResponse<ApiResponse<Order>>>;
    
    // Legacy service methods for backward compatibility
    getOrderDetails(id: string): Promise<AxiosResponse<ApiResponse<Order>>>;
    getUserOrders(params: any): Promise<AxiosResponse<ApiResponse<any>>>;
    getAllOrders(params: any): Promise<AxiosResponse<ApiResponse<{
        orders: Order[];
        total_count: number;
        page: number;
        page_size: number;
    }>>>;
    getOrderById(id: string): Promise<AxiosResponse<ApiResponse<Order>>>;
}

export interface IPaymentService {
    // New standardized interface methods
    processPayment(paymentData: PaymentDto): Promise<AxiosResponse<ApiResponse>>;
    getPaymentMethods(): Promise<AxiosResponse<{
        success: boolean;
        methods: Array<{
            name: string;
            configured: boolean;
        }>;
    }>>;
    getPaymentStatus(paymentId: string): Promise<AxiosResponse<ApiResponse>>;
    
    // Legacy service methods for backward compatibility
    createPaymentUrl(data: any): Promise<AxiosResponse<{
        success: boolean;
        paymentUrl: string;
        selectedMethod: string;
    }>>;
    getPaymentMethodConfig(method: string): Promise<AxiosResponse<{
        success: boolean;
        method: string;
        configRequirements: string[];
        isConfigured: boolean;
    }>>;
    checkPaymentMethodStatus(): Promise<AxiosResponse<{
        success: boolean;
        status: Record<string, { available: boolean; configured: boolean }>;
    }>>;
}

export interface IApiServiceFactory {
    createAuthService(): IAuthService;
    createProductService(): IProductService;
    createCartService(): ICartService;
    createOrderService(): IOrderService;
    createPaymentService(): IPaymentService;
}