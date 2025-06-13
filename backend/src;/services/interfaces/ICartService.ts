// src/services/interfaces/IOrderService.ts
import {
    CartContent,
    CartSummary,
    DeliveryFeeResult,
    CartValidationResult,
    AddToCartParams,
    UpdateCartItemParams,
    RemoveFromCartParams,
    CalculateDeliveryFeeParams
} from '../../models/entity/Cart';

export interface ICartService {
    getOrCreateSession(sessionId?: string): Promise<string>;
    getCartBySession(sessionId: string): Promise<string>;
    addToCart(params: AddToCartParams): Promise<boolean>;
    updateCartItem(params: UpdateCartItemParams): Promise<boolean>;
    removeFromCart(params: RemoveFromCartParams): Promise<boolean>;
    getCartContents(sessionId: string): Promise<CartContent[]>;
    getCartSummary(sessionId: string): Promise<CartSummary>;
    validateCart(sessionId: string): Promise<CartValidationResult>;
    calculateDeliveryFees(params: CalculateDeliveryFeeParams): Promise<DeliveryFeeResult>;
    clearCart(sessionId: string): Promise<boolean>;
    cleanExpiredSessions(): Promise<number>;
}