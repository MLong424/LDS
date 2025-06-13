import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = this.createAxiosInstance();
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }

    private getApiUrl(): string {
        const api_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
        return api_URL;
    }

    private createAxiosInstance(): AxiosInstance {
        const instance = axios.create({
            baseURL: this.getApiUrl(),
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        this.setupInterceptors(instance);
        return instance;
    }

    private setupInterceptors(instance: AxiosInstance): void {
        instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // JWT token is handled via cookies automatically due to withCredentials: true
                // No need to manually set Authorization header
                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Clear any stored user data on unauthorized access
                    localStorage.removeItem('user');
                    // Cookies are cleared automatically by server
                }
                return Promise.reject(error);
            }
        );
    }
}

const axiosInstance = ApiClient.getInstance().getAxiosInstance();

export { axiosInstance, ApiClient };
