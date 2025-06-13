// src/models/repository/ProductRepository.ts
import { IDatabaseConnection } from '../../config/interfaces';
import { IProductRepository } from '../interfaces/IProductRepository';
import {
    CompleteProduct,
    ProductCreateData,
    ProductUpdateData,
    ProductSearchParams,
    PMProductSearchParams,
    ProductSearchResult,
    ProductListItem,
    PriceHistoryItem
} from '../entity/Product';
import { ProductFactory } from '../factory/ProductFactory';

export class ProductRepository implements IProductRepository {
    private db: IDatabaseConnection;
    
    constructor(db: IDatabaseConnection) {
        this.db = db;
    }

    /**
     * Create a new media product using Factory Method Pattern
     * @param data Product creation data
     * @param userId ID of the product manager creating the product
     * @returns ID of the newly created product
     */
    async createProduct(data: ProductCreateData, userId: string): Promise<number> {
        try {
            // Validate product data using factory method pattern
            const validation = ProductFactory.validateProductData(data.media_type, data);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check if media type is supported
            if (!ProductFactory.isMediaTypeSupported(data.media_type)) {
                throw new Error(`Unsupported media type: ${data.media_type}`);
            }

            // Create product instance using factory method
            const product = ProductFactory.createProduct(data.media_type, data);

            // Validate the created product instance
            const stockValidation = product.validateStock(1); // Validate minimum stock
            if (!stockValidation.isValid) {
                throw new Error(`Stock validation failed: ${stockValidation.message}`);
            }

            const sqlQuery = 'SELECT create_media_product($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)';
            const values = [
                // Common product attributes
                data.title,
                data.barcode,
                data.base_value,
                data.current_price,
                data.stock,
                data.media_type,
                data.product_description,
                data.dimensions,
                data.weight,
                userId,
                data.warehouse_entry_date || new Date(),
                
                // Book specific attributes
                data.book_authors,
                data.book_cover_type,
                data.book_publisher,
                data.book_publication_date,
                data.book_pages,
                data.book_language,
                data.book_genre,
                
                // CD specific attributes
                data.cd_artists,
                data.cd_record_label,
                data.cd_tracklist,
                data.cd_genre,
                data.cd_release_date,
                
                // LP Record specific attributes
                data.lp_artists,
                data.lp_record_label,
                data.lp_tracklist,
                data.lp_genre,
                data.lp_release_date,
                
                // DVD specific attributes
                data.dvd_disc_type,
                data.dvd_director,
                data.dvd_runtime,
                data.dvd_studio,
                data.dvd_language,
                data.dvd_subtitles,
                data.dvd_release_date,
                data.dvd_genre
            ];
            
            const result = await this.db.query<{ create_media_product: number }>(sqlQuery, values);
            return result[0].create_media_product;
        } catch (error) {
            console.error('Error creating product:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update an existing media product using Factory Method Pattern
     * @param productId ID of the product to update
     * @param data Product update data
     * @param userId ID of the product manager updating the product
     * @returns ID of the updated product
     */
    async updateProduct(productId: number, data: ProductUpdateData, userId: string): Promise<number> {
        try {
            // Get existing product to determine media type
            const existingProduct = await this.getProductById(productId);
            
            // Create update data with media type for validation
            const updateDataWithType: ProductCreateData = {
                ...existingProduct,
                ...data,
                media_type: existingProduct.media_type
            };

            // Validate updated product data using factory method pattern
            const validation = ProductFactory.validateProductData(existingProduct.media_type, updateDataWithType);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Create product instance to validate business rules using factory
            const product = ProductFactory.createProduct(existingProduct.media_type, updateDataWithType);
            
            // Validate stock if it's being updated
            if (data.stock !== undefined) {
                const stockValidation = product.validateStock(1);
                if (!stockValidation.isValid) {
                    throw new Error(`Stock validation failed: ${stockValidation.message}`);
                }
            }

            const sqlQuery = 'SELECT update_media_product($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)';
            const values = [
                // Required parameters first
                productId,
                userId,
                
                // Common product attributes
                data.title,
                data.barcode,
                data.base_value,
                data.current_price,
                data.stock,
                data.product_description,
                data.dimensions,
                data.weight,
                
                // Book specific attributes
                data.book_authors,
                data.book_cover_type,
                data.book_publisher,
                data.book_publication_date,
                data.book_pages,
                data.book_language,
                data.book_genre,
                
                // CD specific attributes
                data.cd_artists,
                data.cd_record_label,
                data.cd_tracklist,
                data.cd_genre,
                data.cd_release_date,
                
                // LP Record specific attributes
                data.lp_artists,
                data.lp_record_label,
                data.lp_tracklist,
                data.lp_genre,
                data.lp_release_date,
                
                // DVD specific attributes
                data.dvd_disc_type,
                data.dvd_director,
                data.dvd_runtime,
                data.dvd_studio,
                data.dvd_language,
                data.dvd_subtitles,
                data.dvd_release_date,
                data.dvd_genre
            ];
            
            const result = await this.db.query<{ update_media_product: number }>(sqlQuery, values);
            return result[0].update_media_product;
        } catch (error) {
            console.error('Error updating product with factory:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get detailed product information by ID using Factory
     * @param productId Product ID
     * @returns Complete product information
     */
    async getProductById(productId: number): Promise<CompleteProduct> {
        try {
            const result = await this.db.query('SELECT get_product_details($1) as product_data', [productId]);
            
            // @ts-ignore
            if (result.length === 0 || !result[0].product_data) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            // @ts-ignore
            const productData = result[0].product_data;            
            
            // Use factory to create complete product with validation
            return this.createCompleteProductFromData(productData);
        } catch (error) {
            console.error('Error getting product with factory:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search products with flexible parameters using Factory validation
     * @param params Search parameters
     * @returns Search results with pagination info
     */
    async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
        try {
            const {
                title,
                media_type,
                min_price,
                max_price,
                author_artist,
                sort_by = 'title',
                sort_order = 'asc',
                page = 1,
                page_size = 20
            } = params;

            // Validate media type if provided using factory
            if (media_type && !ProductFactory.isMediaTypeSupported(media_type)) {
                throw new Error(`Unsupported media type: ${media_type}`);
            }
            
            const result = await this.db.query<ProductListItem & { total_count: number }>(
                'SELECT * FROM search_products($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [title, media_type, min_price, max_price, author_artist, sort_by, sort_order, page, page_size]
            );
            
            // Calculate total pages
            const total_count = result.length > 0 ? Number(result[0].total_count) : 0;
            const total_pages = Math.ceil(total_count / page_size);
            
            return {
                products: result,
                total_count,
                page,
                page_size,
                total_pages
            };
        } catch (error) {
            console.error('Error searching products with factory:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get random products for customer homepage
     * @param pageSize Number of products to return
     * @returns List of random products
     */
    async getRandomProducts(pageSize: number = 20): Promise<ProductListItem[]> {
        try {
            return await this.db.query<ProductListItem>('SELECT * FROM get_random_products($1)', [pageSize]);
        } catch (error) {
            console.error('Error getting random products:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Product manager view of products with advanced filtering using Factory validation
     * @param params Search parameters for product managers
     * @param userId User ID of the product manager
     * @returns Search results with pagination info
     */
    async pmViewProducts(params: PMProductSearchParams, userId: string): Promise<ProductSearchResult> {
        try {
            const {
                title,
                media_type,
                min_price,
                max_price,
                include_out_of_stock = true,
                manager_sort_by = 'id',
                sort_order = 'asc',
                page = 1,
                page_size = 20
            } = params;

            // Validate media type if provided using factory
            if (media_type && !ProductFactory.isMediaTypeSupported(media_type)) {
                throw new Error(`Unsupported media type: ${media_type}`);
            }
            
            const result = await this.db.query<ProductListItem & { total_count: number, last_price_change?: Date }>(
                'SELECT * FROM pm_view_products($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [title, media_type, min_price, max_price, include_out_of_stock, manager_sort_by, sort_order, page, page_size, userId]
            );
            
            // Calculate total pages
            const total_count = result.length > 0 ? Number(result[0].total_count) : 0;
            const total_pages = Math.ceil(total_count / page_size);
            
            return {
                products: result,
                total_count,
                page,
                page_size,
                total_pages
            };
        } catch (error) {
            console.error('Error viewing products as PM with factory:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get price history for a product
     * @param productId Product ID
     * @param userId Optional user ID for authorization
     * @returns List of price history items
     */
    async getProductPriceHistory(productId: number, userId?: string): Promise<PriceHistoryItem[]> {
        try {
            return await this.db.query<PriceHistoryItem>('SELECT * FROM get_product_price_history($1, $2)', [productId, userId]);
        } catch (error) {
            console.error('Error getting price history:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if a product is eligible for rush delivery using product instance validation
     * @param productId Product ID
     * @returns Whether the product is eligible for rush delivery
     */
    async isProductRushDeliveryEligible(productId: number): Promise<boolean> {
        try {
            const result = await this.db.query<{ is_product_rush_delivery_eligible: boolean }>(
                'SELECT is_product_rush_delivery_eligible($1) as is_product_rush_delivery_eligible', 
                [productId]
            );
            return result[0].is_product_rush_delivery_eligible;
        } catch (error) {
            console.error('Error checking rush delivery eligibility:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create complete product from database data
     */
    private createCompleteProductFromData(productData: any): CompleteProduct {
        // Validate media type
        if (!ProductFactory.isMediaTypeSupported(productData.media_type)) {
            throw new Error(`Product has unsupported media type: ${productData.media_type}`);
        }

        // Extract nested data and merge with base data
        const mergedData = { ...productData };
        
        // Extract type-specific data from nested objects
        switch (productData.media_type) {
            case 'BOOK':
                if (productData.book) {
                    mergedData.book_authors = productData.book.authors;
                    mergedData.book_cover_type = productData.book.cover_type;
                    mergedData.book_publisher = productData.book.publisher;
                    mergedData.book_publication_date = productData.book.publication_date;
                    mergedData.book_pages = productData.book.pages;
                    mergedData.book_language = productData.book.language;
                    mergedData.book_genre = productData.book.genre;
                }
                break;
            case 'CD':
                if (productData.cd) {
                    mergedData.cd_artists = productData.cd.artists;
                    mergedData.cd_record_label = productData.cd.record_label;
                    mergedData.cd_tracklist = productData.cd.tracklist;
                    mergedData.cd_genre = productData.cd.genre;
                    mergedData.cd_release_date = productData.cd.release_date;
                }
                break;
            case 'LP_RECORD':
                if (productData.lp_record) {
                    mergedData.lp_artists = productData.lp_record.artists;
                    mergedData.lp_record_label = productData.lp_record.record_label;
                    mergedData.lp_tracklist = productData.lp_record.tracklist;
                    mergedData.lp_genre = productData.lp_record.genre;
                    mergedData.lp_release_date = productData.lp_record.release_date;
                }
                break;
            case 'DVD':
                if (productData.dvd) {
                    mergedData.dvd_disc_type = productData.dvd.disc_type;
                    mergedData.dvd_director = productData.dvd.director;
                    mergedData.dvd_runtime = productData.dvd.runtime;
                    mergedData.dvd_studio = productData.dvd.studio;
                    mergedData.dvd_language = productData.dvd.language;
                    mergedData.dvd_subtitles = productData.dvd.subtitles;
                    mergedData.dvd_release_date = productData.dvd.release_date;
                    mergedData.dvd_genre = productData.dvd.genre;
                }
                break;
        }

        // Create product using merged data
        const baseProduct = ProductFactory.createProduct(productData.media_type, mergedData);
        const completeProduct: CompleteProduct = baseProduct as CompleteProduct;

        // Add type-specific nested objects
        switch (productData.media_type) {
            case 'BOOK':
                completeProduct.book = baseProduct as any;
                break;
            case 'CD':
                completeProduct.cd = baseProduct as any;
                break;
            case 'LP_RECORD':
                completeProduct.lp_record = baseProduct as any;
                break;
            case 'DVD':
                completeProduct.dvd = baseProduct as any;
                break;
        }

        return completeProduct;
    }
}