// src/models/entity/Product.ts
export type MediaType = 'BOOK' | 'CD' | 'LP_RECORD' | 'DVD';
export type CoverType = 'PAPERBACK' | 'HARDCOVER';
export type DiscType = 'BLU_RAY' | 'HD_DVD' | 'STANDARD';

// Base Product interface with common attributes using Template Method Pattern
export abstract class Product {
    id!: number;
    title!: string;
    barcode!: string;
    category_id?: number;
    base_value!: number; // Product value without VAT
    current_price!: number; // Current selling price without VAT
    stock!: number;
    media_type!: MediaType;
    product_description!: string;
    dimensions!: string;
    weight!: number; // Weight in kg
    warehouse_entry_date!: Date;
    created_at!: Date;
    updated_at!: Date;

    /**
     * Template method for calculating final price with VAT
     * This method defines the structure but allows subclasses to customize VAT calculation
     */
    public getPriceWithVAT(): number {
        const vatRate = this.getVATRate();
        const basePrice = this.getCurrentPrice();
        return this.calculateFinalPrice(basePrice, vatRate);
    }

    /**
     * Template method for generating product display information
     * This method defines the structure for displaying product information
     */
    public getProductDisplayInfo(): string {
        const basicInfo = this.getBasicDisplayInfo();
        const specificInfo = this.getSpecificDisplayInfo();
        const priceInfo = this.getPriceDisplayInfo();
        
        return this.formatDisplayInfo(basicInfo, specificInfo, priceInfo);
    }

    /**
     * Template method for stock validation
     * This method defines the structure for stock-related operations
     */
    public validateStock(requestedQuantity: number): { isValid: boolean; message: string } {
        if (!this.isStockCheckRequired()) {
            return { isValid: true, message: 'Stock check not required for this product type' };
        }

        const currentStock = this.getCurrentStock();
        const minimumStock = this.getMinimumStockThreshold();
        
        return this.performStockValidation(requestedQuantity, currentStock, minimumStock);
    }

    // Common methods that can be overridden by subclasses
    protected getVATRate(): number {
        return 0.1; // Default 10% VAT
    }

    protected getCurrentPrice(): number {
        return this.current_price;
    }

    protected calculateFinalPrice(basePrice: number, vatRate: number): number {
        return basePrice * (1 + vatRate);
    }

    protected getBasicDisplayInfo(): string {
        return `${this.title} (${this.media_type})`;
    }

    protected getPriceDisplayInfo(): string {
        return `Price: ${this.current_price} (excl. VAT), ${this.getPriceWithVAT()} (incl. VAT)`;
    }

    protected formatDisplayInfo(basicInfo: string, specificInfo: string, priceInfo: string): string {
        return `${basicInfo} | ${specificInfo} | ${priceInfo}`;
    }

    protected isStockCheckRequired(): boolean {
        return true; // Most products require stock check
    }

    protected getCurrentStock(): number {
        return this.stock;
    }

    protected getMinimumStockThreshold(): number {
        return 1; // Default minimum stock
    }

    protected performStockValidation(
        requested: number, 
        current: number, 
        minimum: number
    ): { isValid: boolean; message: string } {
        if (requested <= 0) {
            return { isValid: false, message: 'Requested quantity must be greater than 0' };
        }

        if (current < requested) {
            return { isValid: false, message: `Insufficient stock. Available: ${current}, Requested: ${requested}` };
        }

        if ((current - requested) < minimum) {
            return { isValid: false, message: `Request would bring stock below minimum threshold (${minimum})` };
        }

        return { isValid: true, message: 'Stock validation passed' };
    }

    // Common utility methods
    public isInStock(): boolean {
        return this.stock > 0;
    }

    // Abstract methods that subclasses must implement
    public abstract getMediaType(): MediaType;
    protected abstract getSpecificDisplayInfo(): string;
    public abstract getSearchableFields(): string[];

    // Add toJSON method to prevent circular references
    public toJSON(): any {
        return {
            id: this.id,
            title: this.title,
            barcode: this.barcode,
            category_id: this.category_id,
            base_value: this.base_value,
            current_price: this.current_price,
            stock: this.stock,
            media_type: this.media_type,
            product_description: this.product_description,
            dimensions: this.dimensions,
            weight: this.weight,
            warehouse_entry_date: this.warehouse_entry_date,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

// Book-specific attributes
export class Book extends Product {
    product_id!: number;
    authors!: string[];
    cover_type!: CoverType;
    publisher!: string;
    publication_date!: Date;
    pages?: number;
    language?: string;
    genre?: string;

    getMediaType(): MediaType {
        return 'BOOK';
    }

    protected getSpecificDisplayInfo(): string {
        return `Authors: ${this.getAuthorsList()}, Publisher: ${this.publisher}`;
    }

    protected getVATRate(): number {
        // Books might have reduced VAT rate in some regions
        return 0.05; // 5% VAT for books
    }

    protected getMinimumStockThreshold(): number {
        // Books might need higher minimum stock due to popularity
        return 2;
    }

    public getAuthorsList(): string {
        return this.authors.join(', ');
    }

    public getSearchableFields(): string[] {
        return [
            this.title,
            this.getAuthorsList(),
            this.publisher,
            this.genre || '',
            this.language || ''
        ];
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            product_id: this.product_id,
            authors: this.authors,
            cover_type: this.cover_type,
            publisher: this.publisher,
            publication_date: this.publication_date,
            pages: this.pages,
            language: this.language,
            genre: this.genre
        };
    }
}

// CD-specific attributes
export class CD extends Product {
    product_id!: number;
    artists!: string[];
    record_label!: string;
    tracklist!: string[];
    genre!: string;
    release_date?: Date;

    getMediaType(): MediaType {
        return 'CD';
    }

    protected getSpecificDisplayInfo(): string {
        return `Artists: ${this.getArtistsList()}, Label: ${this.record_label}`;
    }

    protected getMinimumStockThreshold(): number {
        // CDs might have different stock requirements
        return 1;
    }

    public getArtistsList(): string {
        return this.artists.join(', ');
    }

    public getSearchableFields(): string[] {
        return [
            this.title,
            this.getArtistsList(),
            this.record_label,
            this.genre
        ];
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            product_id: this.product_id,
            artists: this.artists,
            record_label: this.record_label,
            tracklist: this.tracklist,
            genre: this.genre,
            release_date: this.release_date
        };
    }
}

// LP Record-specific attributes
export class LPRecord extends Product {
    product_id!: number;
    artists!: string[];
    record_label!: string;
    tracklist!: string[];
    genre!: string;
    release_date?: Date;

    getMediaType(): MediaType {
        return 'LP_RECORD';
    }

    protected getSpecificDisplayInfo(): string {
        return `Artists: ${this.getArtistsList()}, Label: ${this.record_label}`;
    }

    protected getMinimumStockThreshold(): number {
        // LP Records might be more valuable, need careful stock management
        return 1;
    }

    protected getVATRate(): number {
        // Vinyl records might have standard VAT
        return 0.1;
    }

    public getArtistsList(): string {
        return this.artists.join(', ');
    }

    public getSearchableFields(): string[] {
        return [
            this.title,
            this.getArtistsList(),
            this.record_label,
            this.genre
        ];
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            product_id: this.product_id,
            artists: this.artists,
            record_label: this.record_label,
            tracklist: this.tracklist,
            genre: this.genre,
            release_date: this.release_date
        };
    }
}

// DVD-specific attributes
export class DVD extends Product {
    product_id!: number;
    disc_type!: DiscType;
    director!: string;
    runtime!: number; // In minutes
    studio!: string;
    language!: string;
    subtitles!: string[];
    release_date?: Date;
    genre?: string;

    getMediaType(): MediaType {
        return 'DVD';
    }

    protected getSpecificDisplayInfo(): string {
        return `Director: ${this.director}, Studio: ${this.studio}, Runtime: ${this.runtime}min`;
    }

    protected getMinimumStockThreshold(): number {
        // DVDs might have different stock requirements based on disc type
        return this.disc_type === 'BLU_RAY' ? 2 : 1;
    }

    protected getVATRate(): number {
        // DVDs might have different VAT rates
        return 0.1;
    }

    public getSearchableFields(): string[] {
        return [
            this.title,
            this.director,
            this.studio,
            this.genre || '',
            this.language
        ];
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            product_id: this.product_id,
            disc_type: this.disc_type,
            director: this.director,
            runtime: this.runtime,
            studio: this.studio,
            language: this.language,
            subtitles: this.subtitles,
            release_date: this.release_date,
            genre: this.genre
        };
    }
}

// Complete product with all attributes based on media type
export interface CompleteProduct extends Product {
    book?: Book;
    cd?: CD;
    lp_record?: LPRecord;
    dvd?: DVD;
}

// Product creation data interface
export interface ProductCreateData {
    title: string;
    barcode: string;
    category_id?: number;
    base_value: number;
    current_price: number;
    stock: number;
    media_type: MediaType;
    product_description: string;
    dimensions: string;
    weight: number;
    warehouse_entry_date?: Date;
    
    // Book specific attributes
    book_authors?: string[];
    book_cover_type?: CoverType;
    book_publisher?: string;
    book_publication_date?: Date;
    book_pages?: number;
    book_language?: string;
    book_genre?: string;
    
    // CD specific attributes
    cd_artists?: string[];
    cd_record_label?: string;
    cd_tracklist?: string[];
    cd_genre?: string;
    cd_release_date?: Date;
    
    // LP Record specific attributes
    lp_artists?: string[];
    lp_record_label?: string;
    lp_tracklist?: string[];
    lp_genre?: string;
    lp_release_date?: Date;
    
    // DVD specific attributes
    dvd_disc_type?: DiscType;
    dvd_director?: string;
    dvd_runtime?: number;
    dvd_studio?: string;
    dvd_language?: string;
    dvd_subtitles?: string[];
    dvd_release_date?: Date;
    dvd_genre?: string;
}

// Product update data interface
export interface ProductUpdateData {
    title?: string;
    barcode?: string;
    base_value?: number;
    current_price?: number;
    stock?: number;
    product_description?: string;
    dimensions?: string;
    weight?: number;
    
    // Book specific attributes
    book_authors?: string[];
    book_cover_type?: CoverType;
    book_publisher?: string;
    book_publication_date?: Date;
    book_pages?: number;
    book_language?: string;
    book_genre?: string;
    
    // CD specific attributes
    cd_artists?: string[];
    cd_record_label?: string;
    cd_tracklist?: string[];
    cd_genre?: string;
    cd_release_date?: Date;
    
    // LP Record specific attributes
    lp_artists?: string[];
    lp_record_label?: string;
    lp_tracklist?: string[];
    lp_genre?: string;
    lp_release_date?: Date;
    
    // DVD specific attributes
    dvd_disc_type?: DiscType;
    dvd_director?: string;
    dvd_runtime?: number;
    dvd_studio?: string;
    dvd_language?: string;
    dvd_subtitles?: string[];
    dvd_release_date?: Date;
    dvd_genre?: string;
}

// Product search parameters
export interface ProductSearchParams {
    title?: string;
    media_type?: MediaType;
    min_price?: number;
    max_price?: number;
    author_artist?: string;
    sort_by?: 'title' | 'price_asc' | 'price_desc' | 'media_type';
    sort_order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
}

// Product manager search parameters (extends search with additional options)
export interface PMProductSearchParams extends ProductSearchParams {
    include_out_of_stock?: boolean;
    manager_sort_by?: 'id' | 'title' | 'price' | 'stock' | 'last_price_change';
}

// Product search result
export interface ProductSearchResult {
    products: ProductListItem[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// Product list item (simplified product for listings)
export interface ProductListItem {
    product_id: number;
    title: string;
    media_type: MediaType;
    base_value: number;
    current_price: number;
    barcode: string;
    book_authors?: string[];
    cd_lp_artists?: string[];
    dvd_director?: string;
    stock?: number;
}

// Price history item
export interface PriceHistoryItem {
    price_change_id: number;
    old_price: number;
    new_price: number;
    changed_by: string;
    changed_at: Date;
}