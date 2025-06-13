// src/pages/manager/Products/AddProduct.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '@contexts/ProductContext';
import { MediaType, Product } from '@cusTypes/products';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2, AlertTriangle, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { MediaTypeSelection, createProductFormSchema, renderMediaSpecificFields } from '@/components/manager/products';

const AddProduct: React.FC = () => {
    const navigate = useNavigate();
    const { createProduct, error } = useProductContext();

    const [selectedMediaType, setSelectedMediaType] = useState<MediaType | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Dynamic form setup based on media type
    const form = useForm<any>({
        resolver: selectedMediaType ? zodResolver(createProductFormSchema(selectedMediaType)) : undefined,
        defaultValues: {
            title: '',
            barcode: '',
            base_value: 0,
            current_price: 0,
            stock: 0,
            media_type: selectedMediaType,
            product_description: '',
            dimensions: '',
            weight: undefined,
            warehouse_entry_date: '',
            // Media-specific defaults
            book_authors: [],
            cd_artists: [],
            cd_tracklist: [],
            lp_artists: [],
            lp_tracklist: [],
            dvd_subtitles: [],
        },
    });

    // Update form when media type changes
    React.useEffect(() => {
        if (selectedMediaType) {
            form.setValue('media_type', selectedMediaType);
        }
    }, [selectedMediaType, form]);

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            // Transform the form data to match API expectations
            const productData: Partial<Product> = {
                title: data.title,
                barcode: data.barcode,
                base_value: data.base_value,
                current_price: data.current_price,
                stock: data.stock,
                media_type: data.media_type,
                product_description: data.product_description || undefined,
                dimensions: data.dimensions || undefined,
                weight: data.weight || undefined,
                warehouse_entry_date: data.warehouse_entry_date || undefined,
            };

            // Add media-specific fields based on type
            if (data.media_type === 'BOOK') {
                Object.assign(productData, {
                    book_authors: data.book_authors,
                    book_cover_type: data.book_cover_type,
                    book_publisher: data.book_publisher,
                    book_publication_date: data.book_publication_date,
                    book_pages: data.book_pages,
                    book_language: data.book_language,
                    book_genre: data.book_genre,
                });
            } else if (data.media_type === 'CD') {
                Object.assign(productData, {
                    cd_artists: data.cd_artists,
                    cd_record_label: data.cd_record_label,
                    cd_tracklist: data.cd_tracklist,
                    cd_genre: data.cd_genre,
                    cd_release_date: data.cd_release_date || undefined,
                });
            } else if (data.media_type === 'LP_RECORD') {
                Object.assign(productData, {
                    lp_artists: data.lp_artists,
                    lp_record_label: data.lp_record_label,
                    lp_tracklist: data.lp_tracklist,
                    lp_genre: data.lp_genre,
                    lp_release_date: data.lp_release_date || undefined,
                });
            } else if (data.media_type === 'DVD') {
                Object.assign(productData, {
                    dvd_disc_type: data.dvd_disc_type,
                    dvd_director: data.dvd_director,
                    dvd_runtime: data.dvd_runtime,
                    dvd_studio: data.dvd_studio,
                    dvd_language: data.dvd_language,
                    dvd_subtitles: data.dvd_subtitles,
                    dvd_release_date: data.dvd_release_date || undefined,
                    dvd_genre: data.dvd_genre || undefined,
                });
            }

            const response = await createProduct(productData);
            console.log('Product created successfully:', response);
            
            setSubmitSuccess(true);
            setTimeout(() => {
                navigate('/manager/catalog');
            }, 1500);
        } catch (err: any) {
            setSubmitError(err?.message || 'Failed to create product. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-700">Product Created Successfully!</h2>
                    <p className="text-muted-foreground">Your product has been added to the catalog. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/manager/catalog')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Catalog
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Add New Product</h1>
                        <p className="text-muted-foreground mt-1">Create a new product entry for your catalog</p>
                    </div>
                </div>
            </div>

            {/* Media Type Selection */}
            <MediaTypeSelection selectedType={selectedMediaType} onSelect={setSelectedMediaType} />

            {/* Form */}
            {selectedMediaType && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Error Display */}
                        {(submitError || error) && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{submitError || error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Basic Product Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>General product details that apply to all media types</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Product Title *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="barcode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Barcode *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ISBN, UPC, EAN, etc." {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    ISBN for books, UPC for CDs/DVDs, etc.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="media_type"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Media Type</FormLabel>
                                                <FormControl>
                                                    <Input value={selectedMediaType} disabled />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="product_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Brief description of the product"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Pricing and Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Inventory</CardTitle>
                                <CardDescription>Set pricing and stock levels for this product</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="base_value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Base Value *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseFloat(e.target.value) || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>Original/wholesale price</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="current_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Price *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseFloat(e.target.value) || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>Selling price to customers</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stock"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stock Quantity *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormDescription>Available inventory</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Physical Properties */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Physical Properties</CardTitle>
                                <CardDescription>
                                    Optional physical specifications for shipping and storage
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="dimensions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dimensions</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="L x W x H (cm)" {...field} />
                                                </FormControl>
                                                <FormDescription>Length x Width x Height</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="weight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight (kg)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseFloat(e.target.value) || undefined)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>Weight in kilograms</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="warehouse_entry_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Warehouse Entry Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormDescription>When item entered warehouse</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media-Specific Fields */}
                        {renderMediaSpecificFields(selectedMediaType, form)}

                        {/* Action Buttons */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/manager/catalog')}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => form.reset()}
                                            disabled={submitting}
                                        >
                                            Reset Form
                                        </Button>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating Product...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Create Product
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default AddProduct;
