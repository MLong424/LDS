// src/types/products.ts
export type MediaType = 'BOOK' | 'CD' | 'LP_RECORD' | 'DVD';

export type BaseProduct = {
    id: number;
    product_id: number;
    title: string;
    barcode: string;
    base_value: number;
    current_price: number;
    stock: number;
    media_type: MediaType;
    product_description?: string;
    dimensions?: string;
    weight?: number;
    warehouse_entry_date?: string;
    created_at?: string;
    updated_at?: string;
};

export type Product = BaseProduct & {
    book?: BookDetails;
    cd?: CdDetails;
    lp_record?: LpRecordDetails;
    dvd?: DvdDetails;
};

export type CoverType = 'PAPERBACK' | 'HARDCOVER';

export type BookDetails = {
    product_id: number;
    authors: string[];
    cover_type: CoverType;
    publisher: string;
    publication_date: string;
    pages: number;
    language: string;
    genre: string;
};

export type CdDetails = {
    product_id: number;
    artists: string[];
    record_label: string;
    tracklist: string[];
    genre: string;
    release_date?: string;
};

export type LpRecordDetails = {
    product_id: number;
    artists: string[];
    record_label: string;
    tracklist: string[];
    genre: string;
    release_date?: string;
};

export type DiscType = 'BLU_RAY' | 'HD_DVD' | 'STANDARD';

export type DvdDetails = {
    product_id: number;
    disc_type: DiscType;
    director: string;
    runtime: number;
    studio: string;
    language: string;
    subtitles: string[];
    release_date?: string;
    genre?: string;
};

export type ProductSearchParams = {
    title?: string;
    media_type?: MediaType;
    min_price?: number;
    max_price?: number;
    author_artist?: string;
    sort_by?: 'title' | 'price_asc' | 'price_desc' | 'media_type';
    page?: number;
    page_size?: number;
};

export type ProductManagerParams = {
    title?: string;
    media_type?: MediaType;
    min_price?: number;
    max_price?: number;
    include_out_of_stock?: boolean;
    manager_sort_by?: 'id' | 'title' | 'price' | 'stock' | 'last_price_change';
    sort_order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
};

export type ProductPriceHistory = {
    price_change_id: number;
    old_price: number;
    new_price: number;
    changed_by: string;
    changed_at: string;
};
