import React, { useState } from 'react';
import { ProductManagerParams } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { ProductFiltersProps } from '@/components/common';

export const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFiltersChange, onReset }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleFilterChange = (key: keyof ProductManagerParams, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value === '' ? undefined : value,
        });
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? 'Simple' : 'Advanced'} Filters
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Search Title</label>
                        <Input
                            placeholder="Search by title..."
                            value={filters.title || ''}
                            onChange={(e) => handleFilterChange('title', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Media Type</label>
                        <Select
                            value={filters.media_type || 'all'}
                            onValueChange={(value) => handleFilterChange('media_type', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent className='bg-amber-200'>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="BOOK">Books</SelectItem>
                                <SelectItem value="CD">CDs</SelectItem>
                                <SelectItem value="LP_RECORD">LP Records</SelectItem>
                                <SelectItem value="DVD">DVDs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Sort By</label>
                        <Select
                            value={filters.manager_sort_by || 'id'}
                            onValueChange={(value) => handleFilterChange('manager_sort_by', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='bg-amber-200'>
                                <SelectItem value="id">Product ID</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="stock">Stock</SelectItem>
                                <SelectItem value="last_price_change">Last Price Change</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Min Price</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={filters.min_price || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'min_price',
                                            e.target.value ? parseFloat(e.target.value) : ''
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Max Price</label>
                                <Input
                                    type="number"
                                    placeholder="999000"
                                    value={filters.max_price || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'max_price',
                                            e.target.value ? parseFloat(e.target.value) : ''
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Sort Order</label>
                                <Select
                                    value={filters.sort_order || 'asc'}
                                    onValueChange={(value) => handleFilterChange('sort_order', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className='bg-amber-200'>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                        <SelectItem value="desc">Descending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="include_out_of_stock"
                                        checked={filters.include_out_of_stock !== false}
                                        onCheckedChange={(checked) =>
                                            handleFilterChange('include_out_of_stock', checked)
                                        }
                                    />
                                    <label htmlFor="include_out_of_stock" className="text-sm font-medium">
                                        Include Out of Stock
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button onClick={onReset} variant="outline" size="sm">
                        Reset Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
