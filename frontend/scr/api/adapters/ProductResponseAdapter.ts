import { AxiosResponse } from 'axios';
import { BaseResponseAdapter } from './ApiAdapter';
import { Product } from '@cusTypes/products';

export class ProductResponseAdapter extends BaseResponseAdapter<Product> {
    adapt(response: AxiosResponse): Product {
        const productData = this.extractData<Product>(response);
        
        if (!productData) {
            throw new Error('Invalid product response: missing product data');
        }

        return {
            id: productData.id,
            product_id: productData.product_id,
            title: productData.title || '',
            barcode: productData.barcode || '',
            base_value: Number(productData.base_value) || 0,
            current_price: Number(productData.current_price) || 0,
            stock: Number(productData.stock) || 0,
            media_type: productData.media_type,
            product_description: productData.product_description,
            dimensions: productData.dimensions,
            weight: productData.weight,
            warehouse_entry_date: productData.warehouse_entry_date,
            created_at: productData.created_at,
            updated_at: productData.updated_at,
            book: productData.book,
            cd: productData.cd,
            lp_record: productData.lp_record,
            dvd: productData.dvd,
        };
    }
}

export class ProductListResponseAdapter extends BaseResponseAdapter<Product[]> {
    adapt(response: AxiosResponse): Product[] {
        const products = this.extractData<Product[]>(response);
        
        if (!Array.isArray(products)) {
            return [];
        }

        const adapter = new ProductResponseAdapter();
        return products.map(product => adapter.adapt({ ...response, data: { data: product } }));
    }
}

export class ProductCreationResponseAdapter extends BaseResponseAdapter<{ id: string; message: string }> {
    adapt(response: AxiosResponse): { id: string; message: string } {
        const data = this.extractData<{ product_id?: string; id?: string }>(response);
        
        return {
            id: data?.product_id || data?.id || '',
            message: this.extractMessage(response),
        };
    }
}