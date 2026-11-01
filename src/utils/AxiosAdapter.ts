import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import MessageDB from '@/utils/MessageDB';

export default class AxiosAdapter {
    private static readonly sharedInstance = new AxiosAdapter();

    private readonly client: AxiosInstance;

    private constructor() {
        this.client = Axios.create();
    }

    static getInstance(): AxiosAdapter {
        return AxiosAdapter.sharedInstance;
    }

    static throwProcessedError(error: AxiosError): never {
        if (error.message === 'Network Error') {
            throw new Error(MessageDB.networkError);
        }
        const errorResponse = error.response as AxiosResponse | undefined;
        if (errorResponse?.status === 403) {
            throw new Error(MessageDB.forbiddenError);
        }
        if (errorResponse?.status === 500) {
            throw new Error(MessageDB.genericError);
        }
        if (Array.isArray(errorResponse?.data?.message)) {
            throw new Error(errorResponse.data.message[0]);
        }
        if (errorResponse?.data?.name) {
            const modifiedError = new Error(errorResponse.data.message);
            modifiedError.name = errorResponse.data.name;
            throw modifiedError;
        }
        throw new Error(errorResponse?.data?.message ?? error.message);
    }

    async post<TPayload, UResponse>(
        url: string,
        payload: TPayload,
        requestConfig: AxiosRequestConfig,
    ): Promise<UResponse> {
        try {
            const response = await this.client.post<UResponse>(url, payload, requestConfig);
            return response.data;
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
    }

    async get<TResponse>(url: string, requestConfig: AxiosRequestConfig): Promise<TResponse> {
        try {
            const response = await this.client.get<TResponse>(url, requestConfig);
            return response.data;
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
    }

    async delete(url: string, requestConfig: AxiosRequestConfig): Promise<void> {
        try {
            await this.client.delete(url, requestConfig);
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
    }

    async put(url: string, requestConfig: AxiosRequestConfig): Promise<void> {
        try {
            await this.client.put(url, undefined, requestConfig);
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
    }
}
