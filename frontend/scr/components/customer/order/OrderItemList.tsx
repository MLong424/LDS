// src/components/order/OrderItemList.tsx
import React from 'react';
import { OrderItem } from '@cusTypes/orders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Zap } from 'lucide-react';

interface OrderItemListProps {
    items: OrderItem[];
}

const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.product_id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center">
                                    {item.product_title}
                                    {item.is_rush_delivery && (
                                        <span title="Rush Delivery">
                                            <Zap className="h-4 w-4 ml-2 text-amber-500" />
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{item.media_type}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.unit_price} VND</TableCell>
                            <TableCell className="text-right">{item.unit_price * item.quantity} VND</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default OrderItemList;
