import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { TableRow, TableCell } from '@/components/ui/table';
import { ProductRowProps } from '@/components/common';
import { getMediaIcon } from '@/utils/mediaIcons'


export const ProductRow: React.FC<ProductRowProps> = ({ product, onEdit, onView }) => {
    const navigate = useNavigate();

    const getStockBadge = (stock: number) => {
        if (stock === 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (stock <= 10) {
            return <Badge variant="secondary">Low Stock</Badge>;
        } else {
            return <Badge variant="default">In Stock</Badge>;
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <span className="text-lg">{getMediaIcon(product.media_type)}</span>
                    <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-muted-foreground">ID: {product.product_id}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline">{product.media_type}</Badge>
            </TableCell>
            <TableCell>
                <div className="font-medium">{product.current_price}</div>
                {product.base_value !== product.current_price && (
                    <div className="text-sm text-muted-foreground line-through">{product.base_value.toFixed(0)}</div>
                )}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <span className="font-medium">{product.stock}</span>
                    {getStockBadge(product.stock)}
                </div>
            </TableCell>
            <TableCell>
                <div className="text-sm text-muted-foreground">
                    {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}
                </div>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className='bg-amber-200'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(product.product_id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product.product_id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigate(`/manager/catalog/${product.product_id}/price-history`)}
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Price History
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
};
