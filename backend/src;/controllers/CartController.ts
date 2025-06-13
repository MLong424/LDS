// src/controllers/CartController.ts - Updated for Factory integration
import { Request, Response } from 'express';
import { AddToCartParams, UpdateCartItemParams, RemoveFromCartParams, CalculateDeliveryFeeParams } from '../models/entity/Cart';
import { ICartService } from '../services/interfaces/ICartService';

export class CartController {
    constructor(private cartService: ICartService) {
        this.initializeCart = this.initializeCart.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.updateCartItem = this.updateCartItem.bind(this);
        this.removeFromCart = this.removeFromCart.bind(this);
        this.getCart = this.getCart.bind(this);
        this.validateCart = this.validateCart.bind(this);
        this.calculateDeliveryFees = this.calculateDeliveryFees.bind(this);
        this.clearCart = this.clearCart.bind(this);
    }

    async initializeCart(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            const newSessionId = await this.cartService.getOrCreateSession(sessionId);
            
            if (newSessionId !== sessionId) {
                res.cookie('session_id', newSessionId, {
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Cart session initialized',
                data: { 
                    session_id: newSessionId,
                    cart_type: 'SHOPPING'
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to initialize cart session',
            });
        }
    }

    async addToCart(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }
            
            const params: AddToCartParams = {
                session_id: sessionId,
                product_id: parseInt(req.body.product_id),
                quantity: parseInt(req.body.quantity)
            };
            
            if (isNaN(params.product_id) || isNaN(params.quantity)) {
                throw new Error('Invalid product ID or quantity');
            }
            
            await this.cartService.addToCart(params);
            
            // Get updated cart summary with enhanced objects
            const cartSummary = await this.cartService.getCartSummary(sessionId);
            
            res.status(200).json({
                status: 'success',
                message: 'Item added to cart',
                data: {
                    ...cartSummary,
                    // Enhanced metadata using Template Method patterns
                    can_proceed_to_checkout: cartSummary.canProceedToCheckout(),
                    insufficient_stock_items: cartSummary.getInsufficientStockItems().length,
                    low_stock_items: cartSummary.getLowStockItems().length,
                    rush_eligible_items: cartSummary.getRushDeliveryEligibleItems().length,
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to add item to cart',
            });
        }
    }

    async updateCartItem(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }
            
            const params: UpdateCartItemParams = {
                session_id: sessionId,
                product_id: parseInt(req.params.productId),
                quantity: parseInt(req.body.quantity)
            };
            
            if (isNaN(params.product_id) || isNaN(params.quantity)) {
                throw new Error('Invalid product ID or quantity');
            }
            
            await this.cartService.updateCartItem(params);
            
            // Get updated cart summary with enhanced objects
            const cartSummary = await this.cartService.getCartSummary(sessionId);
            
            res.status(200).json({
                status: 'success',
                message: 'Cart item updated',
                data: {
                    ...cartSummary,
                    // Enhanced metadata using Template Method patterns
                    can_proceed_to_checkout: cartSummary.canProceedToCheckout(),
                    insufficient_stock_items: cartSummary.getInsufficientStockItems().length,
                    low_stock_items: cartSummary.getLowStockItems().length,
                    rush_eligible_items: cartSummary.getRushDeliveryEligibleItems().length,
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update cart item',
            });
        }
    }

    async removeFromCart(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }
            
            const params: RemoveFromCartParams = {
                session_id: sessionId,
                product_id: parseInt(req.params.productId)
            };
            
            if (isNaN(params.product_id)) {
                throw new Error('Invalid product ID');
            }
            
            await this.cartService.removeFromCart(params);
            
            // Get updated cart summary with enhanced objects
            const cartSummary = await this.cartService.getCartSummary(sessionId);
            
            res.status(200).json({
                status: 'success',
                message: 'Item removed from cart',
                data: {
                    ...cartSummary,
                    // Enhanced metadata using Template Method patterns
                    can_proceed_to_checkout: cartSummary.canProceedToCheckout(),
                    insufficient_stock_items: cartSummary.getInsufficientStockItems().length,
                    low_stock_items: cartSummary.getLowStockItems().length,
                    rush_eligible_items: cartSummary.getRushDeliveryEligibleItems().length,
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to remove item from cart',
            });
        }
    }

    async getCart(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }
            
            const cartSummary = await this.cartService.getCartSummary(sessionId);
            
            res.status(200).json({
                status: 'success',
                data: {
                    ...cartSummary,
                    // Enhanced metadata using Template Method patterns
                    cart_type: 'SHOPPING',
                    can_proceed_to_checkout: cartSummary.canProceedToCheckout(),
                    checkout_ready: cartSummary.canProceedToCheckout(),
                    item_breakdown: {
                        total_items: cartSummary.item_count,
                        insufficient_stock: cartSummary.getInsufficientStockItems().length,
                        low_stock: cartSummary.getLowStockItems().length,
                        rush_eligible: cartSummary.getRushDeliveryEligibleItems().length,
                    },
                    estimated_savings: cartSummary.calculateSavings(),
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to get cart contents',
            });
        }
    }

    async validateCart(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }
            
            const validationResult = await this.cartService.validateCart(sessionId);
            
            res.status(200).json({
                status: 'success',
                data: {
                    ...validationResult,
                    // Enhanced metadata using Template Method patterns
                    validation_summary: validationResult.getValidationSummary(),
                    has_invalid_items: validationResult.hasInvalidItems(),
                    invalid_items_count: validationResult.getInvalidItemsCount(),
                    can_proceed: validationResult.is_valid,
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to validate cart',
            });
        }
    }

    async calculateDeliveryFees(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }
            
            const params: CalculateDeliveryFeeParams = {
                session_id: sessionId,
                province: req.body.province,
                address: req.body.address,
                is_rush_delivery: req.body.is_rush_delivery === true
            };
            
            if (!params.province || !params.address) {
                throw new Error('Province and address are required');
            }
            
            const deliveryFees = await this.cartService.calculateDeliveryFees(params);
            
            res.status(200).json({
                status: 'success',
                data: {
                    ...deliveryFees,
                    // Enhanced metadata using Template Method patterns
                    delivery_type: params.is_rush_delivery ? 'RUSH' : 'STANDARD',
                    total_delivery_fee: deliveryFees.getTotalDeliveryFee(params.is_rush_delivery || false),
                    estimated_delivery_time: params.is_rush_delivery ? '1-2 business days' : '3-5 business days',
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to calculate delivery fees',
            });
        }
    }

    async clearCart(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }
            
            await this.cartService.clearCart(sessionId);
            
            res.status(200).json({
                status: 'success',
                message: 'Cart cleared successfully',
                data: {
                    session_id: sessionId,
                    cart_type: 'SHOPPING',
                    items_removed: 'ALL'
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to clear cart',
            });
        }
    }
}