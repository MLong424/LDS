// src/models/factory/ProductFactory.ts
import { Product, Book, CD, DVD, LPRecord, MediaType, ProductCreateData } from '../entity/Product';

export class ProductFactory {
    private static creators: Map<MediaType, ProductCreator> = new Map();
    private static validationRules: Map<MediaType, ValidationRule[]> = new Map();

    /**
     * Register a product creator for a media type (Open for extension)
     */
    static registerCreator(mediaType: MediaType, creator: ProductCreator): void {
        this.creators.set(mediaType, creator);
    }

    /**
     * Register validation rules for a media type (Open for extension)
     */
    static registerValidationRules(mediaType: MediaType, rules: ValidationRule[]): void {
        this.validationRules.set(mediaType, rules);
    }

    /**
     * Create product using registered creator (Closed for modification)
     */
    static createProduct(mediaType: MediaType, data: ProductCreateData): Product {
        const creator = this.creators.get(mediaType);
        if (!creator) {
            throw new Error(`No creator registered for media type: ${mediaType}`);
        }
        return creator.createProduct(data);
    }

    /**
     * Validate product data using registered rules (Closed for modification)
     */
    static validateProductData(mediaType: MediaType, data: ProductCreateData): { isValid: boolean; errors: string[] } {
        const rules = this.validationRules.get(mediaType) || [];
        const errors: string[] = [];

        for (const rule of rules) {
            const result = rule.validate(data);
            if (!result.isValid) {
                errors.push(...result.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Get all supported media types
     */
    static getSupportedMediaTypes(): MediaType[] {
        return Array.from(this.creators.keys());
    }

    /**
     * Check if media type is supported
     */
    static isMediaTypeSupported(mediaType: string): mediaType is MediaType {
        return this.creators.has(mediaType as MediaType);
    }

    /**
     * Initialize default creators and validation rules
     */
    static initialize(): void {
        // Register default creators
        this.registerCreator('BOOK', new BookCreator());
        this.registerCreator('CD', new CDCreator());
        this.registerCreator('LP_RECORD', new LPRecordCreator());
        this.registerCreator('DVD', new DVDCreator());

        // Register default validation rules
        this.registerValidationRules('BOOK', [new CommonValidationRule(), new BookValidationRule()]);
        this.registerValidationRules('CD', [new CommonValidationRule(), new CDValidationRule()]);
        this.registerValidationRules('LP_RECORD', [new CommonValidationRule(), new LPRecordValidationRule()]);
        this.registerValidationRules('DVD', [new CommonValidationRule(), new DVDValidationRule()]);
    }
}

// Abstract interfaces for extensibility
export interface ProductCreator {
    createProduct(data: ProductCreateData): Product;
}

export interface ValidationRule {
    validate(data: ProductCreateData): { isValid: boolean; errors: string[] };
}

// Concrete implementations
class BookCreator implements ProductCreator {
    createProduct(data: ProductCreateData): Book {
        const book = new Book();
        this.setCommonProperties(book, data);
        this.setBookSpecificProperties(book, data);
        return book;
    }

    private setCommonProperties(book: Book, data: ProductCreateData): void {
        book.title = data.title;
        book.barcode = data.barcode;
        book.category_id = data.category_id;
        book.base_value = data.base_value;
        book.current_price = data.current_price;
        book.stock = data.stock;
        book.media_type = data.media_type;
        book.product_description = data.product_description;
        book.dimensions = data.dimensions;
        book.weight = data.weight;
        book.created_at = new Date();
        book.updated_at = new Date();
        book.warehouse_entry_date = data.warehouse_entry_date || new Date();
    }

    private setBookSpecificProperties(book: Book, data: ProductCreateData): void {
        book.authors = data.book_authors || [];
        book.cover_type = data.book_cover_type || 'PAPERBACK';
        book.publisher = data.book_publisher || '';
        book.publication_date = data.book_publication_date || new Date();
        book.pages = data.book_pages;
        book.language = data.book_language;
        book.genre = data.book_genre;
    }
}

class CDCreator implements ProductCreator {
    createProduct(data: ProductCreateData): CD {
        const cd = new CD();
        this.setCommonProperties(cd, data);
        this.setCDSpecificProperties(cd, data);
        return cd;
    }

    private setCommonProperties(cd: CD, data: ProductCreateData): void {
        cd.title = data.title;
        cd.barcode = data.barcode;
        cd.category_id = data.category_id;
        cd.base_value = data.base_value;
        cd.current_price = data.current_price;
        cd.stock = data.stock;
        cd.media_type = data.media_type;
        cd.product_description = data.product_description;
        cd.dimensions = data.dimensions;
        cd.weight = data.weight;
        cd.created_at = new Date();
        cd.updated_at = new Date();
        cd.warehouse_entry_date = data.warehouse_entry_date || new Date();
    }

    private setCDSpecificProperties(cd: CD, data: ProductCreateData): void {
        cd.artists = data.cd_artists || [];
        cd.record_label = data.cd_record_label || '';
        cd.tracklist = data.cd_tracklist || [];
        cd.genre = data.cd_genre || '';
        cd.release_date = data.cd_release_date;
    }
}

class LPRecordCreator implements ProductCreator {
    createProduct(data: ProductCreateData): LPRecord {
        const lpRecord = new LPRecord();
        this.setCommonProperties(lpRecord, data);
        this.setLPRecordSpecificProperties(lpRecord, data);
        return lpRecord;
    }

    private setCommonProperties(lpRecord: LPRecord, data: ProductCreateData): void {
        lpRecord.title = data.title;
        lpRecord.barcode = data.barcode;
        lpRecord.category_id = data.category_id;
        lpRecord.base_value = data.base_value;
        lpRecord.current_price = data.current_price;
        lpRecord.stock = data.stock;
        lpRecord.media_type = data.media_type;
        lpRecord.product_description = data.product_description;
        lpRecord.dimensions = data.dimensions;
        lpRecord.weight = data.weight;
        lpRecord.created_at = new Date();
        lpRecord.updated_at = new Date();
        lpRecord.warehouse_entry_date = data.warehouse_entry_date || new Date();
    }

    private setLPRecordSpecificProperties(lpRecord: LPRecord, data: ProductCreateData): void {
        lpRecord.artists = data.lp_artists || [];
        lpRecord.record_label = data.lp_record_label || '';
        lpRecord.tracklist = data.lp_tracklist || [];
        lpRecord.genre = data.lp_genre || '';
        lpRecord.release_date = data.lp_release_date;
    }
}

class DVDCreator implements ProductCreator {
    createProduct(data: ProductCreateData): DVD {
        const dvd = new DVD();
        this.setCommonProperties(dvd, data);
        this.setDVDSpecificProperties(dvd, data);
        return dvd;
    }

    private setCommonProperties(dvd: DVD, data: ProductCreateData): void {
        dvd.title = data.title;
        dvd.barcode = data.barcode;
        dvd.category_id = data.category_id;
        dvd.base_value = data.base_value;
        dvd.current_price = data.current_price;
        dvd.stock = data.stock;
        dvd.media_type = data.media_type;
        dvd.product_description = data.product_description;
        dvd.dimensions = data.dimensions;
        dvd.weight = data.weight;
        dvd.created_at = new Date();
        dvd.updated_at = new Date();
        dvd.warehouse_entry_date = data.warehouse_entry_date || new Date();
    }

    private setDVDSpecificProperties(dvd: DVD, data: ProductCreateData): void {
        dvd.disc_type = data.dvd_disc_type || 'STANDARD';
        dvd.director = data.dvd_director || '';
        dvd.runtime = data.dvd_runtime || 0;
        dvd.studio = data.dvd_studio || '';
        dvd.language = data.dvd_language || '';
        dvd.subtitles = data.dvd_subtitles || [];
        dvd.release_date = data.dvd_release_date;
        dvd.genre = data.dvd_genre;
    }
}

// Validation Rules
class CommonValidationRule implements ValidationRule {
    validate(data: ProductCreateData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.title?.trim()) errors.push('Title is required');
        if (!data.barcode?.trim()) errors.push('Barcode is required');
        if (data.base_value <= 0) errors.push('Base value must be greater than 0');
        if (data.current_price <= 0) errors.push('Current price must be greater than 0');
        if (data.stock < 0) errors.push('Stock cannot be negative');
        if (!data.dimensions?.trim()) errors.push('Dimensions are required');
        if (data.weight <= 0) errors.push('Weight must be greater than 0');
        if (!data.product_description?.trim()) errors.push('Product description is required');

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

class BookValidationRule implements ValidationRule {
    validate(data: ProductCreateData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.book_authors || data.book_authors.length === 0) {
            errors.push('At least one author is required for books');
        }
        if (!data.book_publisher) {
            errors.push('Publisher is required for books');
        }
        if (data.book_pages && data.book_pages <= 0) {
            errors.push('Page count must be greater than 0');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

class CDValidationRule implements ValidationRule {
    validate(data: ProductCreateData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.cd_artists || data.cd_artists.length === 0) {
            errors.push('At least one artist is required for CDs');
        }
        if (!data.cd_record_label) {
            errors.push('Record label is required for CDs');
        }
        if (!data.cd_genre) {
            errors.push('Genre is required for CDs');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

class LPRecordValidationRule implements ValidationRule {
    validate(data: ProductCreateData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.lp_artists || data.lp_artists.length === 0) {
            errors.push('At least one artist is required for LP records');
        }
        if (!data.lp_record_label) {
            errors.push('Record label is required for LP records');
        }
        if (!data.lp_genre) {
            errors.push('Genre is required for LP records');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

class DVDValidationRule implements ValidationRule {
    validate(data: ProductCreateData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.dvd_director) {
            errors.push('Director is required for DVDs');
        }
        if (!data.dvd_studio) {
            errors.push('Studio is required for DVDs');
        }
        if (!data.dvd_runtime || data.dvd_runtime <= 0) {
            errors.push('Valid runtime is required for DVDs');
        }
        if (!data.dvd_language) {
            errors.push('Language is required for DVDs');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}