// src/components/home/FeaturedProducts.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductContext } from '@contexts/ProductContext';
import ProductCard from '../product/ProductCard';
import { LoadingSpinner } from '@components/common';
import { ErrorAlert } from '@components/common';

import { Button } from '@/components/ui/button';
import { ChevronRight, BookText, Disc, Film, Music } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';

const FeaturedProducts: React.FC = () => {
    const { getRandomProducts, products, loading, error } = useProductContext();
    const [activeTab, setActiveTab] = useState<string>('all');

    useEffect(() => {
        // Fetch random products on component mount
        getRandomProducts();
    }, [getRandomProducts]);
    
    // Filter products based on active tab
    const filteredProducts = products.filter((product) => {
        if (activeTab === 'all') return true;
        return product.media_type === activeTab;
    });

    return (
        <div className="py-10">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
                    <p className="text-muted-foreground mt-1">Discover our handpicked selection for you</p>
                </div>
                <Button asChild variant="ghost" className="mt-2 sm:mt-0">
                    <Link to="/shop" className="flex items-center">
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-5 w-full md:w-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="BOOK" className="flex items-center gap-1">
                        <BookText className="h-4 w-4" />
                        <span className="hidden sm:inline">Books</span>
                    </TabsTrigger>
                    <TabsTrigger value="CD" className="flex items-center gap-1">
                        <Disc className="h-4 w-4" />
                        <span className="hidden sm:inline">CDs</span>
                    </TabsTrigger>
                    <TabsTrigger value="DVD" className="flex items-center gap-1">
                        <Film className="h-4 w-4" />
                        <span className="hidden sm:inline">DVDs</span>
                    </TabsTrigger>
                    <TabsTrigger value="LP_RECORD" className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        <span className="hidden sm:inline">Records</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {loading ? (
                <LoadingSpinner message="Loading featured products..." />
            ) : error ? (
                <ErrorAlert message={error} />
            ) : (
                <div>
                    {filteredProducts.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No products found in this category.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.product_id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeaturedProducts;
