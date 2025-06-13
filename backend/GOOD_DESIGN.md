# AIMS Backend Design Analysis Report

## 1. DESIGN PATTERNS VIOLATIONS & IMPROVEMENTS

### 1.1 Singleton Pattern Issues

**Problem Areas:**
- `DatabaseConnection` class tạo multiple instances thay vì singleton
- `EmailService` được khởi tạo nhiều lần trong các controllers

**Files:** `database.ts`, `EmailService.ts`, `AuthController.ts`, `OrderController.ts`

**Why Fix:**
```typescript
// Current: Multiple instances
private emailService = new EmailService(); // Trong mỗi controller

// Should be: Singleton pattern
class EmailService {
    private static instance: EmailService;
    private constructor() { ... }
    public static getInstance(): EmailService { ... }
}
```

**Impact:** Tốn memory, không consistent configuration, khó maintain.

---

### 1.2 Template Method Pattern Missing

**Problem Areas:**
- `Product` class hierarchy không implement template method properly
- Email sending logic không có common template

**Files:** `Product.ts`, `EmailService.ts`, `EmailTemplates.ts`

**Why Fix:**
```typescript
// Current: Duplicate logic in each email type
sendOrderConfirmationEmail() { /* duplicate structure */ }
sendOrderCancellationEmail() { /* duplicate structure */ }

// Should be: Template method
abstract class EmailTemplate {
    public sendEmail(): void {
        this.prepareHeaders();
        this.buildContent(); // abstract
        this.sendViaTransporter();
    }
    protected abstract buildContent(): string;
}
```

**Impact:** Code duplication, inconsistent email formats, hard to maintain templates.

---

### 1.3 Strategy Pattern Incomplete

**Problem Areas:**
- Delivery fee calculation hardcoded trong `CartRepository`
- Product creation logic mixed trong repository

**Files:** `CartRepository.ts`, `ProductRepository.ts`

**Why Fix:**
```typescript
// Current: Hardcoded delivery calculation
// Should be: Strategy pattern
interface DeliveryStrategy {
    calculateFee(params: DeliveryParams): number;
}
class StandardDeliveryStrategy implements DeliveryStrategy { ... }
class RushDeliveryStrategy implements DeliveryStrategy { ... }
```

**Impact:** Violates OCP, hard to add new delivery types, testing khó khăn.

---

### 1.4 Factory Method Pattern Missing

**Problem Areas:**
- Product creation không có factory pattern
- Database connection creation scattered

**Files:** `ProductRepository.ts`, `Product.ts`, `database.ts`

**Why Fix:**
```typescript
// Current: Direct instantiation
const product = new Book(); // Scattered throughout code

// Should be: Factory pattern
class ProductFactory {
    static createProduct(type: MediaType, data: ProductData): Product {
        switch(type) {
            case 'BOOK': return new Book(data);
            case 'CD': return new CD(data);
            // ...
        }
    }
}
```

**Impact:** Violates OCP khi thêm product types mới, không centralized creation logic.

---

### 1.5 Adapter Pattern Missing

**Problem Areas:**
- No adapter cho different payment providers
- Database result mapping không có adapter

**Files:** `PaymentController.ts`, repository files

**Why Fix:**
- Khi integrate payment providers mới, cần adapter để convert interfaces
- Database responses cần adapter để convert to domain objects

---

### 1.6 Observer Pattern Missing

**Problem Areas:**
- Order status changes không notify observers
- Inventory updates không trigger events

**Files:** `OrderService.ts`, `ProductService.ts`

**Why Fix:**
```typescript
// Should implement:
interface OrderObserver {
    onOrderStatusChanged(order: Order): void;
}
class EmailNotificationObserver implements OrderObserver { ... }
class InventoryObserver implements OrderObserver { ... }
```

**Impact:** Tight coupling, hard to add notifications, không flexible cho future requirements.

---

## 2. SOLID PRINCIPLES VIOLATIONS

### 2.1 Single Responsibility Principle (SRP) Violations

**Problem Areas:**

#### AuthController
**File:** `AuthController.ts`
**Issues:** Handles login, register, password reset, logout, token management
```typescript
// Current: Multiple responsibilities
class AuthController {
    login() { ... }
    register() { ... }
    updatePassword() { ... }
    resetPassword() { ... }
    completePasswordReset() { ... }
    logout() { ... }
}

// Should be: Separate controllers
class AuthController { login(), logout() }
class RegistrationController { register() }
class PasswordController { updatePassword(), resetPassword() }
```

#### OrderController  
**File:** `OrderController.ts`
**Issues:** Handles order creation, management, customer operations, admin operations
- Customer order operations
- Admin order management
- Payment processing coordination
- Email notifications

#### EmailService
**File:** `EmailService.ts` 
**Issues:** Handles multiple email types and SMTP configuration
```typescript
// Should separate:
class EmailTransporter { ... } // SMTP config
class OrderEmailService { ... } // Order-related emails
class AuthEmailService { ... } // Auth-related emails
```

---

### 2.2 Open/Closed Principle (OCP) Violations

**Problem Areas:**

#### Product Creation Logic
**File:** `ProductRepository.ts`, `Product.ts`
**Issues:** 
- Adding new media types requires modifying existing code
- Switch statements in product creation
- Hardcoded product type checks

```typescript
// Current: Violates OCP
function createProduct(type: MediaType) {
    switch(type) {
        case 'BOOK': // Need to modify this when adding new types
        case 'CD':
        case 'DVD':
        case 'LP_RECORD':
    }
}

// Should be: Open for extension, closed for modification
abstract class ProductCreator {
    abstract createProduct(): Product;
}
```

#### Payment Processing
**File:** `PaymentController.ts`
**Issues:** Adding new payment methods requires code changes

---

### 2.3 Liskov Substitution Principle (LSP) Violations

**Problem Areas:**

#### Product Inheritance
**File:** `Product.ts`
**Issues:** 
- Abstract class `Product` has concrete implementation
- Subclasses may not properly substitute base class
- Mixed abstract and concrete methods

```typescript
// Current: LSP violation
abstract class Product {
    getPriceWithVAT(): number { return this.current_price * 1.1; } // Concrete
    abstract getMediaType(): MediaType; // Abstract
}

// Book might need different VAT calculation, violating LSP
```

---

### 2.4 Interface Segregation Principle (ISP) Violations

**Problem Areas:**

#### Large Interfaces
**Files:** `IOrderService.ts`, `IProductService.ts`, `IUserService.ts`
**Issues:**
- `IOrderService` có quá nhiều methods không related
- Clients forced to depend on methods they don't use

```typescript
// Current: Fat interface
interface IOrderService {
    createOrder(); // Customer operation
    approveOrder(); // Admin operation  
    getUserOrders(); // Customer operation
    getAllOrdersByProductManager(); // Admin operation
}

// Should be: Segregated interfaces
interface ICustomerOrderService { createOrder(), getUserOrders() }
interface IAdminOrderService { approveOrder(), getAllOrders() }
```

---

### 2.5 Dependency Inversion Principle (DIP) Violations

**Problem Areas:**

#### Direct Dependencies
**Files:** Most controllers
**Issues:**
- Controllers create `EmailService` directly instead of injection
- Services depend on concrete implementations

```typescript
// Current: DIP violation
class AuthController {
    private emailService = new EmailService(); // Direct dependency
}

// Should be: Dependency injection
class AuthController {
    constructor(private emailService: IEmailService) {}
}
```

---

## 3. COUPLING & COHESION ISSUES

### 3.1 Tight Coupling Issues

#### High Coupling Problems:

**Email Service Coupling**
**Files:** `AuthController.ts`, `OrderController.ts`
```typescript
// Current: Tight coupling
private emailService = new EmailService();

// Should be: Loose coupling through DI
constructor(private emailService: IEmailService) {}
```

**Database Coupling**
**Files:** Repository classes
**Issues:** Direct SQL queries instead of query builders/ORMs

**Configuration Coupling**
**Files:** Multiple files
**Issues:** Hard-coded configuration values scattered throughout

### 3.2 Low Cohesion Issues

#### Mixed Responsibilities:

**AuthController Low Cohesion**
- Authentication logic
- Email sending logic  
- Token management
- Password reset workflow

**OrderController Low Cohesion**
- Order creation (customer)
- Order management (admin)
- Payment coordination
- Email notifications

**ProductRepository Low Cohesion**
- CRUD operations
- Search functionality
- Business logic (rush delivery eligibility)
- Price history management

---

## 4. ADDITIONAL ISSUES

### 4.1 Error Handling
- Inconsistent error handling across services
- Generic error messages
- No proper error hierarchy

### 4.2 Validation
- Validation logic scattered
- No centralized validation strategy
- Mixed business rules and validation

### 4.3 Configuration Management
- Hard-coded values
- No centralized configuration
- Environment-specific logic in business code

---

## 5. RECOMMENDED REFACTORING PRIORITY

### High Priority:
1. **SRP Violations**: Break down large controllers and services
2. **DIP Violations**: Implement proper dependency injection
3. **Missing Factory Pattern**: For product creation
4. **Missing Observer Pattern**: For order status changes

### Medium Priority:
1. **Strategy Pattern**: For delivery calculations and email templates
2. **Template Method**: For common workflows
3. **ISP Violations**: Break down large interfaces

### Low Priority:
1. **Singleton Pattern**: For configuration and shared services
2. **Adapter Pattern**: For external service integration
3. **LSP Violations**: Improve inheritance hierarchy

---

## 6. CONCLUSION

The current codebase has several design issues that impact:
- **Maintainability**: Hard to modify and extend
- **Testability**: Tight coupling makes unit testing difficult  
- **Scalability**: Violating OCP makes adding features expensive
- **Code Quality**: Low cohesion and high coupling reduce readability

Addressing these issues will significantly improve the codebase quality and development velocity.