// src/models/repository/CartRepository.ts - Updated for Factory integration
import { IDatabaseConnection } from '../../config/interfaces';
import { ICartRepository } from '../interfaces/ICartRepository';
import {
    CartContent,
    CartSummary,
    DeliveryFeeResult,
    CartValidationResult,
    AddToCartParams,
    UpdateCartItemParams,
    RemoveFromCartParams,
    CalculateDeliveryFeeParams,
} from '../entity/Cart';
import { IDeliveryService } from '../../services/interfaces/IDeliveryService';
import { DeliveryParams } from '../../services/interfaces/IDeliveryStrategy';
import { DeliveryStrategyType } from '../../services/delivery/DeliveryStrategyFactory';

export class CartRepository implements ICartRepository {
    private db: IDatabaseConnection;
    private deliveryService: IDeliveryService;

    constructor(db: IDatabaseConnection, deliveryService: IDeliveryService) {
        this.db = db;
        this.deliveryService = deliveryService;
    }

    async getOrCreateSession(sessionId?: string): Promise<string> {
        try {
            const result = await this.db.query<{ get_or_create_session: string }>(
                'SELECT get_or_create_session($1) as get_or_create_session',
                [sessionId]
            );
            return result[0].get_or_create_session;
        } catch (error) {
            console.error('Error creating or getting session:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getCartBySession(sessionId: string): Promise<string> {
        try {
            const result = await this.db.query<{ get_cart_by_session: string }>(
                'SELECT get_cart_by_session($1) as get_cart_by_session',
                [sessionId]
            );
            return result[0].get_cart_by_session;
        } catch (error) {
            console.error('Error getting cart:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async addToCart(params: AddToCartParams): Promise<boolean> {
        try {
            const { session_id, product_id, quantity } = params;

            const result = await this.db.query<{ add_to_cart: boolean }>(
                'SELECT add_to_cart($1, $2, $3) as add_to_cart',
                [session_id, product_id, quantity]
            );
            return result[0].add_to_cart;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateCartItem(params: UpdateCartItemParams): Promise<boolean> {
        try {
            const { session_id, product_id, quantity } = params;

            const result = await this.db.query<{ update_cart_item: boolean }>(
                'SELECT update_cart_item($1, $2, $3) as update_cart_item',
                [session_id, product_id, quantity]
            );
            return result[0].update_cart_item;
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async removeFromCart(params: RemoveFromCartParams): Promise<boolean> {
        try {
            const { session_id, product_id } = params;

            const result = await this.db.query<{ remove_from_cart: boolean }>(
                'SELECT remove_from_cart($1, $2) as remove_from_cart',
                [session_id, product_id]
            );
            return result[0].remove_from_cart;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get cart contents - now returns enhanced CartContent objects
     */
    async getCartContents(sessionId: string): Promise<CartContent[]> {
        try {
            const result = await this.db.query<any>('SELECT * FROM get_cart_contents($1)', [sessionId]);
            
            // Create CartContent objects using the enhanced class
            return result.map(item => new CartContent(item));
        } catch (error) {
            console.error('Error getting cart contents:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get cart summary - now returns enhanced CartSummary object
     */
    async getCartSummary(sessionId: string): Promise<CartSummary> {
        try {
            // Get cart contents using enhanced objects
            const cartContents = await this.getCartContents(sessionId);

            // Calculate totals using Template Method Pattern
            const total_excluding_vat = cartContents.reduce((sum, item) => sum + item.subtotal, 0);
            const vat_amount = total_excluding_vat * 0.1; // 10% VAT
            const total_including_vat = total_excluding_vat + vat_amount;
            const item_count = cartContents.reduce((sum, item) => sum + item.quantity, 0);
            const has_insufficient_stock = cartContents.some((item) => item.stock_status === 'INSUFFICIENT');

            // Create CartSummary using enhanced class
            return new CartSummary({
                items: cartContents,
                total_excluding_vat,
                vat_amount,
                total_including_vat,
                item_count,
                has_insufficient_stock,
            });
        } catch (error) {
            console.error('Error calculating cart summary:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate cart - now returns enhanced CartValidationResult object
     */
    async validateCart(sessionId: string): Promise<CartValidationResult> {
        try {
            const result = await this.db.query<any>('SELECT * FROM validate_cart($1)', [sessionId]);
            
            // Create CartValidationResult using enhanced class
            return new CartValidationResult(result[0]);
        } catch (error) {
            console.error('Error validating cart:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Calculate delivery fees - now returns enhanced DeliveryFeeResult object
     */
    async calculateDeliveryFees(params: CalculateDeliveryFeeParams): Promise<DeliveryFeeResult> {
        try {
            const { session_id, province, address, is_rush_delivery = false } = params;

            // Get cart contents using enhanced objects
            const cartContents = await this.getCartContents(session_id);
            
            if (cartContents.length === 0) {
                throw new Error('Cart is empty');
            }

            // Calculate total order value using Template Method Pattern
            const total_excluding_vat = cartContents.reduce((sum, item) => sum + item.subtotal, 0);
            const vat_amount = total_excluding_vat * 0.1;
            const total_including_vat = total_excluding_vat + vat_amount;

            // Get heaviest item weight from database
            const heaviestItemResult = await this.db.query<{ weight: number }>(
                `SELECT MAX(p.weight) as weight 
                 FROM cart_items ci 
                 JOIN products p ON ci.product_id = p.id 
                 WHERE ci.session_id = $1`,
                [session_id]
            );
            
            const heaviest_item_weight = heaviestItemResult[0]?.weight || 0.5;

            // Prepare delivery parameters
            const deliveryParams: DeliveryParams = {
                province,
                address,
                totalOrderValue: total_including_vat,
                heaviestItemWeight: heaviest_item_weight,
                isRushDelivery: is_rush_delivery
            };

            // Calculate delivery fees using strategy
            const strategyType: DeliveryStrategyType = is_rush_delivery ? 'RUSH' : 'STANDARD';
            const deliveryCalculation = this.deliveryService.calculateDeliveryFee(deliveryParams, strategyType);

            // Create enhanced DeliveryFeeResult object
            return new DeliveryFeeResult({
                standard_delivery_fee: deliveryCalculation.standardDeliveryFee,
                rush_delivery_fee: deliveryCalculation.rushDeliveryFee,
                free_shipping_applied: deliveryCalculation.freeShippingApplied,
                total_order_value: total_including_vat,
                heaviest_item_weight: heaviest_item_weight
            });

        } catch (error) {
            console.error('Error calculating delivery fees:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async clearCart(sessionId: string): Promise<boolean> {
        try {
            const result = await this.db.query<{ clear_cart: boolean }>('SELECT clear_cart($1) as clear_cart', [
                sessionId,
            ]);
            return result[0].clear_cart;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async cleanExpiredSessions(): Promise<number> {
        try {
            const result = await this.db.query<{ clean_expired_sessions: number }>(
                'SELECT clean_expired_sessions() as clean_expired_sessions'
            );
            return result[0].clean_expired_sessions;
        } catch (error) {
            console.error('Error cleaning expired sessions:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export default CartRepository;