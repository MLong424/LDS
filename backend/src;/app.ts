// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { DatabaseConnectionFactoryCreator } from './config/factory/DatabaseConnectionFactory';
import { ServiceFactoryCreator } from './services/factory/ServiceFactory';

// Routes imports
import {
    createAuthRoutes,
    createUserRoutes,
    createCartRoutes,
    createProductRoutes,
    createOrderRoutes,
    createPaymentRoutes
} from './routes';

// Initialize factories
import { ProductFactory } from './models/factory/ProductFactory';
import { PaymentStrategyFactory } from './services/payment/PaymentStrategyFactory';
import { DeliveryStrategyFactory } from './services/delivery/DeliveryStrategyFactory';

// Create Express application
const app: Application = express();
app.set('trust proxy', 1);

// Initialize all factories (Open for extension)
ProductFactory.initialize();
PaymentStrategyFactory.initialize();
DeliveryStrategyFactory.initialize();

// Database setup using Factory Method Pattern (Closed for modification)
const dbConnection = DatabaseConnectionFactoryCreator.createDatabaseConnection();

// Create all services using Factory Method Pattern (Closed for modification)
const services = ServiceFactoryCreator.createAllServices(dbConnection);
const segregatedServices = ServiceFactoryCreator.createSegregatedServices(dbConnection);

// Extract services from factory
const {
    authService,
    userService,
    cartService,
    productService,
    orderService,
    orderPaymentService,
    deliveryService,
    emailService,
    emailTransporter,
    orderEmailService,
    authEmailService
} = services;

// Extract payment repository from segregated services
const { paymentRepository } = segregatedServices;

// Make services available throughout the application
app.locals.cartService = cartService;
app.locals.emailService = emailService;
app.locals.deliveryService = deliveryService;
app.locals.emailTransporter = emailTransporter;
app.locals.orderEmailService = orderEmailService;
app.locals.authEmailService = authEmailService;

// Middlewares (Closed for modification)
export const getAllowedOrigins = () => {
    const origins: string[] = [];

    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }

    if (process.env.CORS_ORIGINS) {
        const additionalOrigins = process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
        origins.push(...additionalOrigins);
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
        origins.push(
            'http://localhost:8081',
            'http://127.0.0.1:8081',
            'http://localhost:3000',
            'http://localhost:19006',
            'http://localhost:8080'
        );
    }

    if (origins.length === 0) {
        console.log('⚠️  No CORS origins specified, using safe defaults');
        return [
            `${process.env.BASE_URL}`,
            'http://localhost:8081',
        ];
    }
    return origins;
};

export const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = getAllowedOrigins();

        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (process.env.NODE_ENV !== 'production') {
            if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.')) {
                console.log(`🔧 Development: Allowing origin ${origin}`);
                return callback(null, true);
            }
        }

        console.log(`🚫 CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'Cache-Control',
    ],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes using Factory-created services with ISP-compliant controllers - DIP compliant
app.use('/api/auth', createAuthRoutes(authService, emailService));
app.use('/api/users', createUserRoutes(userService));
app.use('/api/cart', createCartRoutes(cartService));
app.use('/api/products', createProductRoutes(productService));
app.use('/api/orders', createOrderRoutes(orderService, orderService, emailService));
app.use('/api/payments', createPaymentRoutes(orderService, orderPaymentService, emailService, paymentRepository));

// Health check route with extensible factory validation (Open for extension)
app.get('/api/health', async (_req: Request, res: Response) => {
    try {
        const dbResult: any = await dbConnection.query('SELECT NOW()');
        
        const emailStatus = await emailTransporter.verifyTransporter();
        const availableDeliveryStrategies = deliveryService.getAvailableStrategies();
        const supportedMediaTypes = productService.getSupportedMediaTypes();

        // Get extensible factory information (Open for extension)
        const ProductFactoryInfo = {
            supportedMediaTypes: ProductFactory.getSupportedMediaTypes(),
            totalCreators: ProductFactory.getSupportedMediaTypes().length
        };

        const paymentFactoryInfo = {
            supportedStrategies: PaymentStrategyFactory.getAvailableStrategies(),
            totalStrategies: PaymentStrategyFactory.getAvailableStrategies().length
        };

        const deliveryFactoryInfo = {
            supportedStrategies: DeliveryStrategyFactory.getAvailableStrategies(),
            totalStrategies: DeliveryStrategyFactory.getAvailableStrategies().length
        };

        res.status(200).json({
            status: 'success',
            message: 'API is running with Complete DIP-Compliant Dependency Inversion and Factory Method Pattern implementation',
            dbConnection: 'Connected via DatabaseConnectionFactory',
            emailService: emailStatus ? 'Connected via Singleton with DI' : 'Not Connected',
            deliveryStrategies: availableDeliveryStrategies,
            supportedMediaTypes: supportedMediaTypes,
            servicesCreatedBy: 'ServiceFactory with DIP compliance',
            dipImplementation: {
                dependencyInjection: {
                    controllers: 'All controllers use constructor injection',
                    services: 'All services depend on interfaces, not concrete classes',
                    repositories: 'Services depend on repository interfaces'
                },
                abstractions: {
                    highlevel: 'Controllers depend on service interfaces',
                    lowlevel: 'Concrete implementations follow interface contracts'
                }
            },
            ocpComplianceFactories: {
                ProductFactory: ProductFactoryInfo,
                PaymentFactory: paymentFactoryInfo,
                DeliveryFactory: deliveryFactoryInfo
            },
            dbResult: dbResult[0].now,
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'API is running but some services failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Base route (Closed for modification)
app.get('/', (req: Request, res: Response) => {
    res.send('AIMS: An Internet Media Store API - Enhanced with Complete DIP-Compliant Dependency Inversion and Factory Method Pattern Implementation');
});

// Error handling middleware (Closed for modification)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong',
    });
});

// Graceful shutdown (Closed for modification)
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await dbConnection.close();
    emailTransporter.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await dbConnection.close();
    emailTransporter.close();
    process.exit(0);
});

export default app;