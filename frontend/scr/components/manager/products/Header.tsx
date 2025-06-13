import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Edit } from 'lucide-react';
import { Product } from '@/types';
import { getMediaIcon } from '@/utils/mediaIcons';

export const ProductListHeader: React.FC<any> = ({ onAddProduct }) => {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Product Catalog</h1>
                <p className="text-muted-foreground mt-1">Manage your product inventory and pricing</p>
            </div>
            <Button onClick={onAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
            </Button>
        </div>
    );
};

export const ProductDetailsHeader: React.FC<{ product: Product, onNavigate: (arg0: any) => void }> = ({ product, onNavigate }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => onNavigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Catalog
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMediaIcon(product.media_type)}</span>
                    <div>
                        <h1 className="text-2xl font-bold">{product.title}</h1>
                        <p className="text-muted-foreground">Product ID: {product.product_id}</p>
                    </div>
                </div>
            </div>
            <Button onClick={() => onNavigate(`/manager/catalog/edit/${product.product_id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
            </Button>
        </div>
    );
};
