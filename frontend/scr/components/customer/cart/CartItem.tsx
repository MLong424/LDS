// src/components/cart/CartItem.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartContext } from '@contexts/CartContext';
import { CartItem as CartItemType } from '@cusTypes/cart';
import { Minus, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { getMediaIcon } from '@utils/mediaIcons';

interface CartItemProps {
    item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateItemQuantity, removeItem, loading } = useCartContext();
    const [localQuantity, setLocalQuantity] = useState<number>(item.quantity);
    
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        if (!isNaN(newValue) && newValue > 0) {
            setLocalQuantity(newValue);
        }
    };

    const handleBlur = () => {
        if (localQuantity !== item.quantity) {
            updateItemQuantity(item.product_id, localQuantity);
        }
    };

    const handleIncrement = () => {
        const newQuantity = item.quantity + 1;
        setLocalQuantity(newQuantity);
        updateItemQuantity(item.product_id, newQuantity);
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            const newQuantity = item.quantity - 1;
            setLocalQuantity(newQuantity);
            updateItemQuantity(item.product_id, newQuantity);
        }
    };

    const handleRemove = () => {
        removeItem(item.product_id);
    };

    return (
        <div className="flex flex-col sm:flex-row py-4">
            {/* Product Image Placeholder and Type Badge */}
            <div className="relative flex-shrink-0 w-full sm:w-24 h-24 bg-muted rounded-md mb-4 sm:mb-0 mr-0 sm:mr-4">
                <div className="absolute inset-0 flex items-center justify-center">
                    {getMediaIcon(item.media_type)}
                </div>
                <Badge variant="outline" className="absolute top-2 left-2">
                    {item.media_type}
                </Badge>
            </div>

            {/* Product Details */}
            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                    {/* Title and Price */}
                    <div>
                        <Link to={`/product/${item.product_id}`} className="text-lg font-medium hover:underline">
                            {item.title}
                        </Link>
                        <p className="text-primary font-semibold mt-1">{item.current_price} VND</p>
                    </div>

                    {/* Subtotal (mobile view shows below item details) */}
                    <div className="mt-2 sm:mt-0 sm:text-right">
                        <p className="text-muted-foreground text-sm">Subtotal</p>
                        <p className="font-semibold">{item.subtotal} VND</p>
                    </div>
                </div>

                {/* Quantity Controls and Stock Warning */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleDecrement}
                            disabled={loading || item.quantity <= 1}
                            className="h-8 w-8"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <input
                            type="text"
                            value={localQuantity}
                            onChange={handleQuantityChange}
                            onBlur={handleBlur}
                            disabled={loading}
                            className="h-8 w-12 mx-1 text-center border rounded"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleIncrement}
                            disabled={loading || item.quantity >= item.available_stock}
                            className="h-8 w-8"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            disabled={loading}
                            className="ml-4 text-red-500"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                        </Button>
                    </div>

                    {/* Stock status warning */}
                    {item.stock_status !== 'AVAILABLE' && (
                        <div className="mt-2 sm:mt-0 flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-xs text-yellow-700">
                                {item.stock_status === 'LOW_STOCK'
                                    ? `Only ${item.available_stock} left in stock`
                                    : 'Out of stock'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartItem;