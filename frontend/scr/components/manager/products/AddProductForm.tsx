import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MediaType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Check, BookOpen, Music, Disc, Film } from 'lucide-react';

// Media type selection component
interface MediaTypeSelectionProps {
    selectedType: MediaType | null;
    onSelect: (type: MediaType) => void;
}

export const MediaTypeSelection: React.FC<MediaTypeSelectionProps> = ({ selectedType, onSelect }) => {
    const mediaTypes = [
        { type: 'BOOK' as MediaType, icon: BookOpen, label: 'Book', description: 'Physical books and publications' },
        { type: 'CD' as MediaType, icon: Music, label: 'CD', description: 'Compact discs and music albums' },
        { type: 'LP_RECORD' as MediaType, icon: Disc, label: 'LP Record', description: 'Vinyl records and LPs' },
        { type: 'DVD' as MediaType, icon: Film, label: 'DVD', description: 'DVDs, Blu-ray, and video content' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Select Product Type</CardTitle>
                <CardDescription>Choose the type of product you want to add</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mediaTypes.map(({ type, icon: Icon, label, description }) => (
                        <div
                            key={type}
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                selectedType === type
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-gray-200 hover:border-primary/50'
                            }`}
                            onClick={() => onSelect(type)}
                        >
                            <div className="text-center space-y-2">
                                <Icon
                                    className={`h-8 w-8 mx-auto ${
                                        selectedType === type ? 'text-primary' : 'text-gray-600'
                                    }`}
                                />
                                <h3 className="font-medium">{label}</h3>
                                <p className="text-sm text-muted-foreground">{description}</p>
                                {selectedType === type && (
                                    <Badge variant="default" className="mt-2">
                                        <Check className="h-3 w-3 mr-1" />
                                        Selected
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Array input component for authors, artists, tracklist, etc.
interface ArrayInputProps {
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    description?: string;
    error?: string;
}

const ArrayInput: React.FC<ArrayInputProps> = ({ label, values, onChange, placeholder, description, error }) => {
    const [inputValue, setInputValue] = useState('');

    const addItem = () => {
        if (inputValue.trim() && !values.includes(inputValue.trim())) {
            onChange([...values, inputValue.trim()]);
            setInputValue('');
        }
    };

    const removeItem = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}

            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholder}
                    onKeyPress={handleKeyPress}
                    className={error ? 'border-destructive' : ''}
                />
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {values.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {values.map((item, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                            {item}
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="ml-2 text-muted-foreground hover:text-destructive"
                            >
                                ×
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
};

// Render media-specific form fields
export const renderMediaSpecificFields = (selectedMediaType: MediaType, form: UseFormReturn<any, any, any>) => {
    if (!selectedMediaType) return null;

    switch (selectedMediaType) {
        case 'BOOK':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Book Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ArrayInput
                            label="Authors *"
                            values={form.watch('book_authors') || []}
                            onChange={(values) => form.setValue('book_authors', values)}
                            placeholder="Enter author name"
                            description="Add one author at a time"
                            error={form.formState.errors.book_authors?.message as string}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="book_cover_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select cover type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='bg-amber-200'>
                                                <SelectItem value="PAPERBACK">Paperback</SelectItem>
                                                <SelectItem value="HARDCOVER">Hardcover</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="book_publisher"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Publisher *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Publisher name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="book_publication_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Publication Date *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="book_pages"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Pages *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="300"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="book_language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="English" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="book_genre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Genre *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Fiction, Science, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            );

        case 'CD':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Music className="h-5 w-5" />
                            CD Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ArrayInput
                            label="Artists *"
                            values={form.watch('cd_artists') || []}
                            onChange={(values) => form.setValue('cd_artists', values)}
                            placeholder="Enter artist name"
                            description="Add one artist at a time"
                            error={form.formState.errors.cd_artists?.message as string}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cd_record_label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Record Label *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Record label name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cd_genre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Genre *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Rock, Pop, Classical, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cd_release_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Release Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <ArrayInput
                            label="Tracklist *"
                            values={form.watch('cd_tracklist') || []}
                            onChange={(values) => form.setValue('cd_tracklist', values)}
                            placeholder="Enter track name"
                            description="Add tracks in order"
                            error={form.formState.errors.cd_tracklist?.message as string}
                        />
                    </CardContent>
                </Card>
            );

        case 'LP_RECORD':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Disc className="h-5 w-5" />
                            LP Record Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ArrayInput
                            label="Artists *"
                            values={form.watch('lp_artists') || []}
                            onChange={(values) => form.setValue('lp_artists', values)}
                            placeholder="Enter artist name"
                            description="Add one artist at a time"
                            error={form.formState.errors.lp_artists?.message as string}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="lp_record_label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Record Label *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Record label name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lp_genre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Genre *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Rock, Jazz, Blues, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lp_release_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Release Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <ArrayInput
                            label="Tracklist *"
                            values={form.watch('lp_tracklist') || []}
                            onChange={(values) => form.setValue('lp_tracklist', values)}
                            placeholder="Enter track name"
                            description="Add tracks in order"
                            error={form.formState.errors.lp_tracklist?.message as string}
                        />
                    </CardContent>
                </Card>
            );

        case 'DVD':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Film className="h-5 w-5" />
                            DVD Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dvd_disc_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Disc Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select disc type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="STANDARD">Standard DVD</SelectItem>
                                                <SelectItem value="BLU_RAY">Blu-ray</SelectItem>
                                                <SelectItem value="HD_DVD">HD DVD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dvd_director"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Director *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Director name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dvd_runtime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Runtime (minutes) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="120"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dvd_studio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Studio *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Studio name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dvd_language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="English" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dvd_genre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Genre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Action, Drama, Comedy, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dvd_release_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Release Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <ArrayInput
                            label="Subtitles"
                            values={form.watch('dvd_subtitles') || []}
                            onChange={(values) => form.setValue('dvd_subtitles', values)}
                            placeholder="Enter subtitle language"
                            description="Add available subtitle languages"
                        />
                    </CardContent>
                </Card>
            );

        default:
            return null;
    }
};
