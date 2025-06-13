// src/config/factory/DatabaseConnectionFactory.ts
import { Pool } from 'pg';
import DatabaseConnection from '../database';

// Pool configuration interface
interface PoolConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: {
        rejectUnauthorized: boolean;
    };
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

// Abstract factory for database connections
abstract class DatabaseConnectionFactory {
    public abstract createConnection(config: PoolConfig): DatabaseConnection;

    /**
     * Template method for creating configured connection
     */
    public createConfiguredConnection(): DatabaseConnection {
        const config = this.createConfiguration();
        const connection = this.createConnection(config);
        this.configureConnection(connection);
        return connection;
    }

    /**
     * Create database configuration
     */
    protected createConfiguration(): PoolConfig {
        return {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME || 'aims',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 20000,
            ssl: { rejectUnauthorized: false },
        };
    }

    /**
     * Configure connection after creation
     */
    protected configureConnection(connection: DatabaseConnection): void {
        // Default configuration - can be overridden by subclasses
    }
}

// Concrete factory for PostgreSQL connections
class PostgreSQLConnectionFactory extends DatabaseConnectionFactory {
    public createConnection(config: PoolConfig): DatabaseConnection {
        return DatabaseConnection.getInstance(config);
    }

    protected configureConnection(connection: DatabaseConnection): void {
        // PostgreSQL specific configuration
        console.log('PostgreSQL connection configured');
    }
}

// Concrete factory for test database connections
class TestDatabaseConnectionFactory extends DatabaseConnectionFactory {
    public createConnection(config: PoolConfig): DatabaseConnection {
        const testConfig = {
            ...config,
            database: process.env.TEST_DB_NAME || 'aims_test',
            max: 5, // Smaller pool for testing
        };
        return DatabaseConnection.getInstance(testConfig);
    }

    protected configureConnection(connection: DatabaseConnection): void {
        console.log('Test database connection configured');
    }
}

// Factory method for creating appropriate database connection factory
export class DatabaseConnectionFactoryCreator {
    /**
     * Factory method to create appropriate database connection factory
     */
    public static createFactory(environment?: string): DatabaseConnectionFactory {
        const env = environment || process.env.NODE_ENV || 'development';

        switch (env) {
            case 'test':
                return new TestDatabaseConnectionFactory();
            case 'development':
            case 'production':
            default:
                return new PostgreSQLConnectionFactory();
        }
    }

    /**
     * Convenience method to get a configured database connection
     */
    public static createDatabaseConnection(environment?: string): DatabaseConnection {
        const factory = this.createFactory(environment);
        return factory.createConfiguredConnection();
    }
}

export { DatabaseConnectionFactory, PostgreSQLConnectionFactory, TestDatabaseConnectionFactory };
