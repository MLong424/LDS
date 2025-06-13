#!/bin/bash

# Create main backend directory structure
mkdir -p backend/src/{models,views,controllers,routes,middlewares,config,utils,services,types,interfaces}

# Create subdirectories in models
mkdir -p backend/src/models/{entity,repository}

# Create entity model files
touch backend/src/models/entity/Product.ts
touch backend/src/models/entity/User.ts
touch backend/src/models/entity/Order.ts
touch backend/src/models/entity/Cart.ts
touch backend/src/models/entity/DeliveryInfo.ts
touch backend/src/models/entity/PaymentTransaction.ts

# Create repository files
touch backend/src/models/repository/ProductRepository.ts
touch backend/src/models/repository/UserRepository.ts
touch backend/src/models/repository/OrderRepository.ts
touch backend/src/models/repository/CartRepository.ts
touch backend/src/models/repository/PaymentRepository.ts

# Create view files (for server-side rendering or API response formatting)
touch backend/src/views/EmailTemplates.ts
touch backend/src/views/ResponseFormatter.ts

# Create controller files
touch backend/src/controllers/ProductController.ts
touch backend/src/controllers/UserController.ts
touch backend/src/controllers/OrderController.ts
touch backend/src/controllers/CartController.ts
touch backend/src/controllers/PaymentController.ts
touch backend/src/controllers/AuthController.ts

# Create route files
touch backend/src/routes/productRoutes.ts
touch backend/src/routes/userRoutes.ts
touch backend/src/routes/orderRoutes.ts
touch backend/src/routes/cartRoutes.ts
touch backend/src/routes/paymentRoutes.ts
touch backend/src/routes/authRoutes.ts
touch backend/src/routes/index.ts

# Create middleware files
touch backend/src/middlewares/auth.ts
touch backend/src/middlewares/error.ts
touch backend/src/middlewares/validator.ts
touch backend/src/middlewares/logging.ts

# Create service files
touch backend/src/services/EmailService.ts
touch backend/src/services/PaymentGatewayService.ts
touch backend/src/services/AuthService.ts
touch backend/src/services/InventoryService.ts

# Create utility files
touch backend/src/utils/helpers.ts
touch backend/src/utils/validators.ts
touch backend/src/utils/formatters.ts
touch backend/src/utils/logger.ts

# Create config files
touch backend/src/config/database.ts
touch backend/src/config/server.ts
touch backend/src/config/email.ts
touch backend/src/config/payment.ts
touch backend/src/config/environment.ts

# Create type definition files
touch backend/src/types/index.ts
touch backend/src/interfaces/index.ts

# Create main application files
touch backend/src/app.ts
touch backend/src/server.ts

# Create TypeScript configuration
cat > backend/tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
EOF


# Create .env file with example environment variables
cat > backend/.env.example << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URI=mongodb://localhost:27017/aims_db

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=user@example.com
EMAIL_PASS=your_email_password

# VNPay Configuration
VNPAY_SANDBOX_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_MERCHANT_ID=your_merchant_id
VNPAY_SECURITY_KEY=your_security_key
VNPAY_RETURN_URL=http://localhost:5000/api/payment/vnpay-return
EOF

echo "Backend MVC folder structure with TypeScript support created successfully!"
