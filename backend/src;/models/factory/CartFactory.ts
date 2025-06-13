// src/models/factory/CartFactory.ts
import { Cart, CartItem, ShoppingCart, StandardCartItem } from "../entity/Cart";

// Factory for creating different cart types
export class CartFactory {
    public static createCart(cartType: string, sessionId: string): Cart {
        switch (cartType.toUpperCase()) {
            case 'SHOPPING':
            default:
                return this.createShoppingCart(sessionId);
        }
    }

    public static createCartItem(itemType: string, productId: number, quantity: number): CartItem {
        switch (itemType.toUpperCase()) {
            case 'STANDARD':
            default:
                return this.createStandardCartItem(productId, quantity);
        }
    }

    private static createShoppingCart(sessionId: string): ShoppingCart {
        const cart = new ShoppingCart();
        cart.session_id = sessionId;
        cart.items = [];
        cart.created_at = new Date();
        return cart;
    }

    private static createStandardCartItem(productId: number, quantity: number): StandardCartItem {
        const item = new StandardCartItem();
        item.product_id = productId;
        item.quantity = quantity;
        return item;
    }


    public static validateCartData(cartType: string, data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.session_id) errors.push('Session ID is required');
        if (!Array.isArray(data.items)) errors.push('Items must be an array');

        // Type-specific validation
        switch (cartType.toUpperCase()) {
            case 'WISHLIST':
                if (data.items && data.items.length > 100) {
                    errors.push('Wishlist cannot contain more than 100 items');
                }
                break;
            case 'SAVE_FOR_LATER':
                if (data.items && data.items.length > 20) {
                    errors.push('Save for later cannot contain more than 20 items');
                }
                break;
            case 'SHOPPING':
                if (data.items && data.items.length > 50) {
                    errors.push('Shopping cart cannot contain more than 50 items');
                }
                break;
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}