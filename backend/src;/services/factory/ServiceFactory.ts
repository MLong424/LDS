// src/services/factory/ServiceFactory.ts
import { IDeliveryService } from '../interfaces/IDeliveryService';
import { IDatabaseConnection } from '../../config/interfaces';
import { EmailService } from '../email/EmailService';
import { EmailTransporter } from '../email/EmailTransporter';
import { OrderEmailService } from '../email/OrderEmailService';
import { AuthEmailService } from '../email/AuthEmailService';

// Repository imports
import {
    AuthRepository,
    UserRepository,
    CartRepository,
    ProductRepository,
    CustomerOrderRepository,
    AdminOrderRepository,
    OrderPaymentRepository,
    PaymentRepository,
} from '../../models/repository';

// Service imports
import { 
    AuthService, 
    CartService, 
    OrderPaymentService,
    DeliveryService,
    UserProfileService,
    AdminUserService,
    ProductBrowsingService,
    ProductManagementService,
    CustomerOrderService,
    AdminOrderService,
    UserService,
    ProductService,
    OrderService
} from '../index';

// Abstract Service Factory
abstract class ServiceFactory {
    protected db: IDatabaseConnection;
    protected emailService: EmailService;
    protected emailTransporter: EmailTransporter;
    protected orderEmailService: OrderEmailService;
    protected authEmailService: AuthEmailService;
    protected deliveryService: IDeliveryService;

    constructor(db: IDatabaseConnection) {
        this.db = db;
        this.emailTransporter = EmailTransporter.getInstance();
        this.orderEmailService = OrderEmailService.getInstance();
        this.authEmailService = AuthEmailService.getInstance();
        this.emailService = EmailService.getInstance();
        this.deliveryService = new DeliveryService();
    }

    // Factory methods for segregated services
    public abstract createAuthService(): AuthService;
    public abstract createUserProfileService(): UserProfileService;
    public abstract createAdminUserService(): AdminUserService;
    public abstract createCartService(): CartService;
    public abstract createProductBrowsingService(): ProductBrowsingService;
    public abstract createProductManagementService(): ProductManagementService;
    public abstract createCustomerOrderService(): CustomerOrderService;
    public abstract createAdminOrderService(): AdminOrderService;
    public abstract createOrderPaymentService(): OrderPaymentService;
    public abstract createDeliveryService(): IDeliveryService;

    // Factory methods for combined services (backward compatibility)
    public abstract createUserService(): UserService;
    public abstract createProductService(): ProductService;
    public abstract createOrderService(): OrderService;
    public abstract createPaymentRepository(): PaymentRepository;

    // Template method for creating segregated services
    public createSegregatedServices(): {
        authService: AuthService;
        userProfileService: UserProfileService;
        adminUserService: AdminUserService;
        cartService: CartService;
        productBrowsingService: ProductBrowsingService;
        productManagementService: ProductManagementService;
        customerOrderService: CustomerOrderService;
        adminOrderService: AdminOrderService;
        orderPaymentService: OrderPaymentService;
        paymentRepository: PaymentRepository;
        deliveryService: IDeliveryService;
        emailService: EmailService;
        emailTransporter: EmailTransporter;
        orderEmailService: OrderEmailService;
        authEmailService: AuthEmailService;
    } {
        return {
            authService: this.createAuthService(),
            userProfileService: this.createUserProfileService(),
            adminUserService: this.createAdminUserService(),
            cartService: this.createCartService(),
            productBrowsingService: this.createProductBrowsingService(),
            productManagementService: this.createProductManagementService(),
            customerOrderService: this.createCustomerOrderService(),
            adminOrderService: this.createAdminOrderService(),
            orderPaymentService: this.createOrderPaymentService(),
            paymentRepository: this.createPaymentRepository(),
            deliveryService: this.createDeliveryService(),
            emailService: this.emailService,
            emailTransporter: this.emailTransporter,
            orderEmailService: this.orderEmailService,
            authEmailService: this.authEmailService
        };
    }

    // Template method for creating combined services (backward compatibility)
    public createAllServices(): {
        authService: AuthService;
        userService: UserService;
        cartService: CartService;
        productService: ProductService;
        orderService: OrderService;
        orderPaymentService: OrderPaymentService;
        deliveryService: IDeliveryService;
        emailService: EmailService;
        emailTransporter: EmailTransporter;
        orderEmailService: OrderEmailService;
        authEmailService: AuthEmailService;
    } {
        return {
            authService: this.createAuthService(),
            userService: this.createUserService(),
            cartService: this.createCartService(),
            productService: this.createProductService(),
            orderService: this.createOrderService(),
            orderPaymentService: this.createOrderPaymentService(),
            deliveryService: this.createDeliveryService(),
            emailService: this.emailService,
            emailTransporter: this.emailTransporter,
            orderEmailService: this.orderEmailService,
            authEmailService: this.authEmailService
        };
    }
}

// Concrete Service Factory for Production
class ProductionServiceFactory extends ServiceFactory {
    // Segregated services
    public createAuthService(): AuthService {
        const authRepository = new AuthRepository(this.db);
        return new AuthService(authRepository);
    }

    public createUserProfileService(): UserProfileService {
        const userRepository = new UserRepository(this.db);
        return new UserProfileService(userRepository);
    }

    public createAdminUserService(): AdminUserService {
        const userRepository = new UserRepository(this.db);
        return new AdminUserService(userRepository);
    }

    public createCartService(): CartService {
        const cartRepository = new CartRepository(this.db, this.deliveryService);
        return new CartService(cartRepository);
    }

    public createProductBrowsingService(): ProductBrowsingService {
        const productRepository = new ProductRepository(this.db);
        return new ProductBrowsingService(productRepository);
    }

    public createProductManagementService(): ProductManagementService {
        const productRepository = new ProductRepository(this.db);
        return new ProductManagementService(productRepository);
    }

    public createCustomerOrderService(): CustomerOrderService {
        const customerOrderRepository = new CustomerOrderRepository(this.db);
        return new CustomerOrderService(customerOrderRepository);
    }

    public createAdminOrderService(): AdminOrderService {
        const adminOrderRepository = new AdminOrderRepository(this.db);
        return new AdminOrderService(adminOrderRepository);
    }

    public createOrderPaymentService(): OrderPaymentService {
        const orderPaymentRepository = new OrderPaymentRepository(this.db);
        return new OrderPaymentService(orderPaymentRepository);
    }

    public createDeliveryService(): IDeliveryService {
        return this.deliveryService;
    }

    // Combined services for backward compatibility
    public createUserService(): UserService {
        const userRepository = new UserRepository(this.db);
        return new UserService(userRepository);
    }

    public createProductService(): ProductService {
        const productRepository = new ProductRepository(this.db);
        return new ProductService(productRepository);
    }

    public createOrderService(): OrderService {
        const customerOrderRepository = new CustomerOrderRepository(this.db);
        const adminOrderRepository = new AdminOrderRepository(this.db);
        return new OrderService(customerOrderRepository, adminOrderRepository);
    }

    public createPaymentRepository(): PaymentRepository {
        return new PaymentRepository(this.db);
    }
}

// Concrete Service Factory for Testing
class TestServiceFactory extends ServiceFactory {
    // Segregated services
    public createAuthService(): AuthService {
        const authRepository = new AuthRepository(this.db);
        return new AuthService(authRepository);
    }

    public createUserProfileService(): UserProfileService {
        const userRepository = new UserRepository(this.db);
        return new UserProfileService(userRepository);
    }

    public createAdminUserService(): AdminUserService {
        const userRepository = new UserRepository(this.db);
        return new AdminUserService(userRepository);
    }

    public createCartService(): CartService {
        const cartRepository = new CartRepository(this.db, this.deliveryService);
        return new CartService(cartRepository);
    }

    public createProductBrowsingService(): ProductBrowsingService {
        const productRepository = new ProductRepository(this.db);
        return new ProductBrowsingService(productRepository);
    }

    public createProductManagementService(): ProductManagementService {
        const productRepository = new ProductRepository(this.db);
        return new ProductManagementService(productRepository);
    }

    public createCustomerOrderService(): CustomerOrderService {
        const customerOrderRepository = new CustomerOrderRepository(this.db);
        return new CustomerOrderService(customerOrderRepository);
    }

    public createAdminOrderService(): AdminOrderService {
        const adminOrderRepository = new AdminOrderRepository(this.db);
        return new AdminOrderService(adminOrderRepository);
    }

    public createOrderPaymentService(): OrderPaymentService {
        const orderPaymentRepository = new OrderPaymentRepository(this.db);
        return new OrderPaymentService(orderPaymentRepository);
    }

    public createDeliveryService(): IDeliveryService {
        const deliveryService = new DeliveryService();
        deliveryService.setDefaultStrategy('STANDARD');
        return deliveryService;
    }

    // Combined services for backward compatibility
    public createUserService(): UserService {
        const userRepository = new UserRepository(this.db);
        return new UserService(userRepository);
    }

    public createProductService(): ProductService {
        const productRepository = new ProductRepository(this.db);
        return new ProductService(productRepository);
    }

    public createOrderService(): OrderService {
        const customerOrderRepository = new CustomerOrderRepository(this.db);
        const adminOrderRepository = new AdminOrderRepository(this.db);
        return new OrderService(customerOrderRepository, adminOrderRepository);
    }

    public createPaymentRepository(): PaymentRepository {
        return new PaymentRepository(this.db);
    }
}

// Service Factory Creator using Factory Method Pattern
export class ServiceFactoryCreator {
    /**
     * Factory method to create appropriate service factory
     */
    public static createFactory(db: IDatabaseConnection, environment?: string): ServiceFactory {
        const env = environment || process.env.NODE_ENV || 'development';
        
        switch (env) {
            case 'test':
                return new TestServiceFactory(db);
            case 'development':
            case 'production':
            default:
                return new ProductionServiceFactory(db);
        }
    }

    /**
     * Create segregated services for ISP compliance
     */
    public static createSegregatedServices(db: IDatabaseConnection, environment?: string) {
        const factory = this.createFactory(db, environment);
        return factory.createSegregatedServices();
    }

    /**
     * Create combined services for backward compatibility
     */
    public static createAllServices(db: IDatabaseConnection, environment?: string) {
        const factory = this.createFactory(db, environment);
        return factory.createAllServices();
    }
}

export { ServiceFactory, ProductionServiceFactory, TestServiceFactory };