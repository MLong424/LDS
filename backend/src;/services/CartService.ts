// src/services/CartService.ts
import { ICartService } from './interfaces/ICartService';
import { ICartRepository } from '../models/interfaces/ICartRepository';
import {
    CartContent,
    CartSummary,
    DeliveryFeeResult,
    CartValidationResult,
    AddToCartParams,
    UpdateCartItemParams,
    RemoveFromCartParams,
    CalculateDeliveryFeeParams
} from '../models/entity/Cart';

export class CartService implements ICartService {
    constructor(private cartRepository: ICartRepository) {}

    getOrCreateSession(sessionId?: string): Promise<string> {
        return this.cartRepository.getOrCreateSession(sessionId);
    }

    getCartBySession(sessionId: string): Promise<string> {
        return this.cartRepository.getCartBySession(sessionId);
    }

    /**
     * Add to cart - now with enhanced validation feedback
     */
    async addToCart(params: AddToCartParams): Promise<boolean> {
        try {
            const result = await this.cartRepository.addToCart(params);
            
            if (result) {
                // Optional: Get updated cart summary for logging/analytics
                const cartSummary = await this.getCartSummary(params.session_id);
                console.log(`Item added to cart. New total: ${cartSummary.total_including_vat}, Items: ${cartSummary.item_count}`);
            }
            
            return result;
        } catch (error) {
            console.error('Error in CartService.addToCart:', error);
            throw error;
        }
    }

    /**
     * Update cart item - now with enhanced validation feedback
     */
    async updateCartItem(params: UpdateCartItemParams): Promise<boolean> {
        try {
            const result = await this.cartRepository.updateCartItem(params);
            
            if (result) {
                // Optional: Get updated cart summary for logging/analytics
                const cartSummary = await this.getCartSummary(params.session_id);
                console.log(`Cart item updated. New total: ${cartSummary.total_including_vat}, Items: ${cartSummary.item_count}`);
            }
            
            return result;
        } catch (error) {
            console.error('Error in CartService.updateCartItem:', error);
            throw error;
        }
    }

    removeFromCart(params: RemoveFromCartParams): Promise<boolean> {
        return this.cartRepository.removeFromCart(params);
    }

    /**
     * Get cart contents - now returns enhanced CartContent objects with methods
     */
    getCartContents(sessionId: string): Promise<CartContent[]> {
        return this.cartRepository.getCartContents(sessionId);
    }

    /**
     * Get cart summary - now returns enhanced CartSummary object with methods
     */
    async getCartSummary(sessionId: string): Promise<CartSummary> {
        const cartSummary = await this.cartRepository.getCartSummary(sessionId);
        
        
        return cartSummary;
    }

    /**
     * Validate cart - now returns enhanced CartValidationResult object with methods
     */
    async validateCart(sessionId: string): Promise<CartValidationResult> {
        const validationResult = await this.cartRepository.validateCart(sessionId);
        
        // Optional: Enhanced logging using Template Method patterns
        if (!validationResult.is_valid) {
            console.warn(`Cart validation failed for ${sessionId}: ${validationResult.getValidationSummary()}`);
            
            if (validationResult.hasInvalidItems()) {
                console.warn(`Invalid items count: ${validationResult.getInvalidItemsCount()}`);
            }
        }
        
        return validationResult;
    }

    /**
     * Calculate delivery fees - now returns enhanced DeliveryFeeResult object with methods
     */
    async calculateDeliveryFees(params: CalculateDeliveryFeeParams): Promise<DeliveryFeeResult> {
        const deliveryResult = await this.cartRepository.calculateDeliveryFees(params);
        
        return deliveryResult;
    }

    clearCart(sessionId: string): Promise<boolean> {
        return this.cartRepository.clearCart(sessionId);
    }

    cleanExpiredSessions(): Promise<number> {
        return this.cartRepository.cleanExpiredSessions();
    }
}