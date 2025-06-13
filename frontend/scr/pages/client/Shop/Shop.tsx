// src/pages/client/Shop/Shop.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductContext } from '@contexts/ProductContext';
import ProductGrid from '@/components/customer/product/ProductGrid';
import { ProductSearchParams, MediaType } from '@cusTypes/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { BookText, Disc, Film, Music, Search, Grid, List } from 'lucide-react';

export const Shop: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, pagination, loading, error, searchProducts } = useProductContext();
    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    
    // Form state (what the user is typing/selecting)
    const [formState, setFormState] = useState<ProductSearchParams>({
        title: searchParams.get('title') || '',
        media_type: (searchParams.get('media_type') as MediaType) || undefined,
        min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
        max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
        author_artist: searchParams.get('author_artist') || '',
        sort_by: (searchParams.get('sort_by') as 'title' | 'price_asc' | 'price_desc' | 'media_type') || undefined,
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        page_size: searchParams.get('page_size') ? Number(searchParams.get('page_size')) : 20,
    });
    
    // Search state (what's actually being used for the search)
    const [searchState, setSearchState] = useState<ProductSearchParams>(formState);

    // Initial search on component mount
    useEffect(() => {
        const performInitialSearch = async () => {
            try {
                await searchProducts(searchState);
            } catch (error) {
                console.error('Error fetching initial products:', error);
            }
        };
        
        performInitialSearch();
    }, []);

    // Update URL with search params
    useEffect(() => {
        const params = new URLSearchParams();

        Object.entries(searchState).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.set(key, String(value));
            }
        });

        setSearchParams(params);
    }, [searchState, setSearchParams]);

    // Handle search form submission
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Apply form state to search state
        const newSearchState = { ...formState, page: 1 };
        setSearchState(newSearchState);
        
        try {
            await searchProducts(newSearchState);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };

    // Handle page change
    const handlePageChange = async (page: number) => {
        const newSearchState = { ...searchState, page };
        setSearchState(newSearchState);
        setFormState(prev => ({ ...prev, page }));
        
        try {
            await searchProducts(newSearchState);
        } catch (error) {
            console.error('Error changing page:', error);
        }
    };

    // Handle page size change
    const handlePageSizeChange = async (page_size: number) => {
        const newSearchState = { ...searchState, page: 1, page_size };
        setSearchState(newSearchState);
        setFormState(prev => ({ ...prev, page: 1, page_size }));
        
        try {
            await searchProducts(newSearchState);
        } catch (error) {
            console.error('Error changing page size:', error);
        }
    };

    // Handle sort change
    const handleSortChange = async (sort_by: string) => {
        const newSort = sort_by === 'default' ? undefined : (sort_by as 'title' | 'price_asc' | 'price_desc' | 'media_type');
        
        const newSearchState = {
            ...searchState,
            sort_by: newSort,
            page: 1,
        };
        
        setSearchState(newSearchState);
        setFormState(prev => ({ ...prev, sort_by: newSort, page: 1 }));
        
        try {
            await searchProducts(newSearchState);
        } catch (error) {
            console.error('Error changing sort:', error);
        }
    };

    // Handle media type filter
    const handleMediaTypeChange = (media_type: string) => {
        setFormState(prev => ({
            ...prev,
            media_type: media_type === 'all' ? undefined : (media_type as MediaType),
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Shop</h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant={layout === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setLayout('grid')}
                    >
                        <Grid className="h-4 w-4" />
                        <span className="sr-only">Grid View</span>
                    </Button>
                    <Button
                        variant={layout === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setLayout('list')}
                    >
                        <List className="h-4 w-4" />
                        <span className="sr-only">List View</span>
                    </Button>
                </div>
            </div>

            {/* Search and Filter Form */}
            <form onSubmit={handleSearch} className="bg-muted p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="title" className="text-sm font-medium block mb-1">
                            Title
                        </label>
                        <div className="flex">
                            <Input
                                id="title"
                                type="text"
                                placeholder="Search by title"
                                value={formState.title || ''}
                                onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="author_artist" className="text-sm font-medium block mb-1">
                            Author/Artist
                        </label>
                        <Input
                            id="author_artist"
                            type="text"
                            placeholder="Search by author/artist"
                            value={formState.author_artist || ''}
                            onChange={(e) => setFormState((prev) => ({ ...prev, author_artist: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label htmlFor="min_price" className="text-sm font-medium block mb-1">
                            Min Price
                        </label>
                        <Input
                            id="min_price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Min price"
                            value={formState.min_price || ''}
                            onChange={(e) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    min_price: e.target.value ? Number(e.target.value) : undefined,
                                }))
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="max_price" className="text-sm font-medium block mb-1">
                            Max Price
                        </label>
                        <Input
                            id="max_price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Max price"
                            value={formState.max_price || ''}
                            onChange={(e) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    max_price: e.target.value ? Number(e.target.value) : undefined,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="media_type" className="text-sm font-medium block mb-1">
                            Media Type
                        </label>
                        <Select 
                            value={formState.media_type || 'all'} 
                            onValueChange={handleMediaTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Media Types" />
                            </SelectTrigger>
                            <SelectContent className="bg-amber-200">
                                <SelectItem value="all">All Media Types</SelectItem>
                                <SelectItem value="BOOK">
                                    <div className="flex items-center">
                                        <BookText className="h-4 w-4 mr-2" />
                                        Books
                                    </div>
                                </SelectItem>
                                <SelectItem value="CD">
                                    <div className="flex items-center">
                                        <Disc className="h-4 w-4 mr-2" />
                                        CDs
                                    </div>
                                </SelectItem>
                                <SelectItem value="DVD">
                                    <div className="flex items-center">
                                        <Film className="h-4 w-4 mr-2" />
                                        DVDs
                                    </div>
                                </SelectItem>
                                <SelectItem value="LP_RECORD">
                                    <div className="flex items-center">
                                        <Music className="h-4 w-4 mr-2" />
                                        Vinyl Records
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="sort_by" className="text-sm font-medium block mb-1">
                            Sort By
                        </label>
                        <Select 
                            value={formState.sort_by || 'default'} 
                            onValueChange={handleSortChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Default Sorting" />
                            </SelectTrigger>
                            <SelectContent className="bg-amber-200">
                                <SelectItem value="default">Default Sorting</SelectItem>
                                <SelectItem value="title">Title (A-Z)</SelectItem>
                                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                                <SelectItem value="media_type">Media Type</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button type="submit" className="w-full" disabled={loading}>
                            <Search className="h-4 w-4 mr-2" />
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Products Grid */}
            <ProductGrid
                products={products}
                loading={loading}
                error={error}
                emptyMessage="No products found matching your search criteria."
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                layout={layout}
            />
        </div>
    );
};

export default Shop;