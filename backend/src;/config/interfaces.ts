// src/config/interfaces.ts
export interface IDatabaseConnection {
    // Basic query with array result
    query<T>(text: string, params?: any[]): Promise<T[]>;
    
    // Query expecting a single result or null
    queryOne<T>(text: string, params?: any[]): Promise<T | null>;
    
    // Query returning only success status
    execute(text: string, params?: any[]): Promise<boolean>;
    
    // Transaction support
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    
    // Connection pool management
    // getClient(): Promise<any>; // Returns a client from the pool
    // releaseClient(client: any): void;
    
    // Batch operations
    // executeBatch(queries: {text: string, params?: any[]}[]): Promise<boolean>;
}