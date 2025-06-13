// src/pages/manager/Products/ProductDetails.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductContext } from '@contexts/ProductContext';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common';

import { DetailedInfo, QuickStats, ProductDetailsHeader } from '@/components/manager/products';

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { product, loading, error, getProductDetails, getPriceHistory, priceHistory } = useProductContext();

    useEffect(() => {
        if (id) {
            const productId = parseInt(id);
            getProductDetails(productId);
            getPriceHistory(productId);
        }
    }, [id, getProductDetails, getPriceHistory]);

    if (loading) {
        return <LoadingSpinner fullPage message="Loading product details..." />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Product not found.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const getStockStatus = () => {
        if (product.stock === 0) {
            return {
                label: 'Out of Stock',
                variant: 'destructive' as const,
                icon: <AlertTriangle className="h-4 w-4" />,
            };
        } else if (product.stock <= 10) {
            return { label: 'Low Stock', variant: 'secondary' as const, icon: <AlertTriangle className="h-4 w-4" /> };
        } else {
            return { label: 'In Stock', variant: 'default' as const, icon: <Check className="h-4 w-4" /> };
        }
    };

    const stockStatus = getStockStatus();

    return (
        <div className="space-y-6">
            {/* Header */}
            <ProductDetailsHeader product={product} onNavigate={navigate} />

            {/* Quick Stats */}
            <QuickStats product={product} stockStatus={stockStatus} />

            {/* Detailed Information */}
            <DetailedInfo product={product} priceHistory={priceHistory} stockStatus={stockStatus}/>

        </div>
    );
};

export default ProductDetails;
