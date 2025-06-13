import { MediaType, Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { z } from 'zod';
export const getSpecificDetails = (product: Product) => {
    if (product.book) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-medium mb-2">Pages</h4>
                    <p className="text-sm text-muted-foreground">{product.book.pages} pages</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Language</h4>
                    <p className="text-sm text-muted-foreground">{product.book.language}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Genre</h4>
                    <p className="text-sm text-muted-foreground">{product.book.genre}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Publication Date</h4>
                    <p className="text-sm text-muted-foreground">
                        {new Date(product.book.publication_date).toLocaleDateString()}
                    </p>
                </div>
            </div>
        );
    } else if (product.cd) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-medium mb-2">Artists</h4>
                    <p className="text-sm text-muted-foreground">{product.cd.artists.join(', ')}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Record Label</h4>
                    <p className="text-sm text-muted-foreground">{product.cd.record_label}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Genre</h4>
                    <p className="text-sm text-muted-foreground">{product.cd.genre}</p>
                </div>
                {product.cd.release_date && (
                    <div>
                        <h4 className="font-medium mb-2">Release Date</h4>
                        <p className="text-sm text-muted-foreground">
                            {new Date(product.cd.release_date).toLocaleDateString()}
                        </p>
                    </div>
                )}
                <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">Tracklist</h4>
                    <div className="space-y-1">
                        {product.cd.tracklist.map((track, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                                {index + 1}. {track}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    } else if (product.lp_record) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-medium mb-2">Artists</h4>
                    <p className="text-sm text-muted-foreground">{product.lp_record.artists.join(', ')}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Record Label</h4>
                    <p className="text-sm text-muted-foreground">{product.lp_record.record_label}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Genre</h4>
                    <p className="text-sm text-muted-foreground">{product.lp_record.genre}</p>
                </div>
                {product.lp_record.release_date && (
                    <div>
                        <h4 className="font-medium mb-2">Release Date</h4>
                        <p className="text-sm text-muted-foreground">
                            {new Date(product.lp_record.release_date).toLocaleDateString()}
                        </p>
                    </div>
                )}
                <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">Tracklist</h4>
                    <div className="space-y-1">
                        {product.lp_record.tracklist.map((track, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                                {index + 1}. {track}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    } else if (product.dvd) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-medium mb-2">Director</h4>
                    <p className="text-sm text-muted-foreground">{product.dvd.director}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Studio</h4>
                    <p className="text-sm text-muted-foreground">{product.dvd.studio}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Disc Type</h4>
                    <Badge variant="outline">{product.dvd.disc_type}</Badge>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Runtime</h4>
                    <p className="text-sm text-muted-foreground">{product.dvd.runtime} minutes</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Language</h4>
                    <p className="text-sm text-muted-foreground">{product.dvd.language}</p>
                </div>
                {product.dvd.genre && (
                    <div>
                        <h4 className="font-medium mb-2">Genre</h4>
                        <p className="text-sm text-muted-foreground">{product.dvd.genre}</p>
                    </div>
                )}
                {product.dvd.release_date && (
                    <div>
                        <h4 className="font-medium mb-2">Release Date</h4>
                        <p className="text-sm text-muted-foreground">
                            {new Date(product.dvd.release_date).toLocaleDateString()}
                        </p>
                    </div>
                )}
                <div>
                    <h4 className="font-medium mb-2">Subtitles</h4>
                    <p className="text-sm text-muted-foreground">{product.dvd.subtitles.join(', ')}</p>
                </div>
            </div>
        );
    }
    return null;
};


const baseProductSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    barcode: z.string().min(1, 'Barcode is required'),
    base_value: z.number().min(0, 'Base value must be non-negative'),
    current_price: z.number().min(0, 'Current price must be non-negative'),
    stock: z.number().int().min(0, 'Stock must be non-negative integer'),
    media_type: z.enum(['BOOK', 'CD', 'LP_RECORD', 'DVD']),
    product_description: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.number().min(0).optional(),
    warehouse_entry_date: z.string().optional(),
});

// Book-specific schema
const bookSchema = z.object({
    book_authors: z.array(z.string().min(1)).min(1, 'At least one author is required'),
    book_cover_type: z.enum(['PAPERBACK', 'HARDCOVER']),
    book_publisher: z.string().min(1, 'Publisher is required'),
    book_publication_date: z.string().min(1, 'Publication date is required'),
    book_pages: z.number().int().min(1, 'Number of pages must be positive'),
    book_language: z.string().min(1, 'Language is required'),
    book_genre: z.string().min(1, 'Genre is required'),
});

// CD schema
const cdSchema = z.object({
    cd_artists: z.array(z.string().min(1)).min(1, 'At least one artist is required'),
    cd_record_label: z.string().min(1, 'Record label is required'),
    cd_tracklist: z.array(z.string().min(1)).min(1, 'At least one track is required'),
    cd_genre: z.string().min(1, 'Genre is required'),
    cd_release_date: z.string().optional(),
});

// LP Record schema
const lpRecordSchema = z.object({
    lp_artists: z.array(z.string().min(1)).min(1, 'At least one artist is required'),
    lp_record_label: z.string().min(1, 'Record label is required'),
    lp_tracklist: z.array(z.string().min(1)).min(1, 'At least one track is required'),
    lp_genre: z.string().min(1, 'Genre is required'),
    lp_release_date: z.string().optional(),
});

// DVD schema
const dvdSchema = z.object({
    dvd_disc_type: z.enum(['BLU_RAY', 'HD_DVD', 'STANDARD']),
    dvd_director: z.string().min(1, 'Director is required'),
    dvd_runtime: z.number().int().min(1, 'Runtime must be positive'),
    dvd_studio: z.string().min(1, 'Studio is required'),
    dvd_language: z.string().min(1, 'Language is required'),
    dvd_subtitles: z.array(z.string().min(1)),
    dvd_release_date: z.string().optional(),
    dvd_genre: z.string().optional(),
});

// Combined schema that changes based on media type
export const createProductFormSchema = (mediaType: MediaType) => {
    switch (mediaType) {
        case 'BOOK':
            return baseProductSchema.merge(bookSchema);
        case 'CD':
            return baseProductSchema.merge(cdSchema);
        case 'LP_RECORD':
            return baseProductSchema.merge(lpRecordSchema);
        case 'DVD':
            return baseProductSchema.merge(dvdSchema);
        default:
            return baseProductSchema;
    }
};