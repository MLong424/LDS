// src/config/database.ts
import { Pool, types } from 'pg';
import { IDatabaseConnection } from './interfaces';

// Define the Pool configuration interface
interface PoolConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: {
        rejectUnauthorized: boolean;
    };
    max?: number; // Maximum number of clients in the pool
    idleTimeoutMillis?: number; // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis?: number; // How long to wait for a connection to be established before timing out
}

class DatabaseConnection implements IDatabaseConnection {
    private static instance: DatabaseConnection;
    private pool: Pool;
    private client: any;
    
    private constructor(config: PoolConfig) {
        this.pool = new Pool(config);
        this.pool.on('connect', () => console.log('Database connected'));
        this.pool.on('error', (err) => {
            console.error('Database connection error', err);
        });
        types.setTypeParser(1700, function(val) {
            return parseFloat(val);
        });
    }

    public static getInstance(config?: PoolConfig): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            if (!config) {
                throw new Error('Database configuration is required for first initialization');
            }
            DatabaseConnection.instance = new DatabaseConnection(config);
        }
        return DatabaseConnection.instance;
    }

    // Reset instance for testing purposes
    public static resetInstance(): void {
        if (DatabaseConnection.instance) {
            DatabaseConnection.instance.pool.end();
            DatabaseConnection.instance = null as any;
        }
    }

    async query<T>(text: string, params?: any[]): Promise<T[]> {
        try {
            // Use transaction client if in a transaction, otherwise use pool
            const queryExecutor = this.client || this.pool;
            const result = await queryExecutor.query(text, params);
            return result.rows as T[];
        } catch (error) {
            throw error;
        }
    }
    
    async queryOne<T>(text: string, params?: any[]): Promise<T | null> {
        try {
            const queryExecutor = this.client || this.pool;
            const result = await queryExecutor.query(text, params);
            return result.rows.length > 0 ? (result.rows[0] as T) : null;
        } catch (error) {
            throw error;
        }
    }
    
    async execute(text: string, params?: any[]): Promise<boolean> {
        try {
            const queryExecutor = this.client || this.pool;
            await queryExecutor.query(text, params);
            return true;
        } catch (error) {
            throw error;
        }
    }
    
    async beginTransaction(): Promise<void> {
        if (this.client) {
            throw new Error("Transaction already in progress");
        }
        this.client = await this.pool.connect();
        await this.client.query('BEGIN');
    }
    
    async commitTransaction(): Promise<void> {
        if (!this.client) {
            throw new Error("No transaction in progress");
        }
        await this.client.query('COMMIT');
        this.client.release();
        this.client = null;
    }
    
    async rollbackTransaction(): Promise<void> {
        if (!this.client) {
            throw new Error("No transaction in progress");
        }
        await this.client.query('ROLLBACK');
        this.client.release();
        this.client = null;
    }

    // Get pool for health checks
    public getPool(): Pool {
        return this.pool;
    }

    // Graceful shutdown
    public async close(): Promise<void> {
        await this.pool.end();
    }
}

export default DatabaseConnection;