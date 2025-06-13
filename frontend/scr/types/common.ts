// src/types/common.ts
export type ApiResponse<T = any> = {
    status: 'success' | 'error';
    message?: string;
    data?: T;
};
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type Sort = 'ASC' | 'DESC';

export interface PaginationType {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}