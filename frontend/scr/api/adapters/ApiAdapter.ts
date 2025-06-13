import { AxiosResponse } from 'axios';

export interface ApiAdapter<TInput, TOutput> {
    adapt(response: TInput): TOutput;
}

export interface ResponseAdapter<T> extends ApiAdapter<AxiosResponse, T> {
    adapt(response: AxiosResponse): T;
}

export abstract class BaseResponseAdapter<T> implements ResponseAdapter<T> {
    abstract adapt(response: AxiosResponse): T;

    protected extractData<D>(response: AxiosResponse): D | null {
        return response.data?.data ?? response.data ?? null;
    }

    protected extractMessage(response: AxiosResponse): string {
        return response.data?.message ?? 'Operation completed successfully';
    }

    protected extractStatus(response: AxiosResponse): number {
        return response.status;
    }

    protected isSuccess(response: AxiosResponse): boolean {
        return response.status >= 200 && response.status < 300;
    }
}