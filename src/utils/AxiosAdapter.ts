import Axios, { AxiosError, AxiosResponse } from 'axios';
import MessageDB from '@/utils/MessageDB';

type RequestConfig = Record<string, unknown>;

export default class AxiosAdapter {
    static throwProcessedError(error: AxiosError): void {
        if (error.message === 'Network Error') {
            throw new Error(MessageDB.networkError);
        }
        const errorResponse = error.response as AxiosResponse;
        if (errorResponse?.status === 403) {
            throw new Error(MessageDB.forbiddenError);
        }
        if (errorResponse?.status === 500) {
            throw new Error(MessageDB.genericError);
        }
        if (Array.isArray(errorResponse?.data?.message)) {
            throw new Error(errorResponse?.data.message[0]);
        }
        if (errorResponse?.data?.name) {
            const modifiedError = new Error(errorResponse?.data.message);
            modifiedError.name = errorResponse?.data.name;
            throw modifiedError;
        }
        throw new Error(errorResponse?.data.message);
    }

    static async post<TPayload, UResponse>(
        url: string,
        payload: TPayload,
        requestConfig: RequestConfig,
    ): Promise<UResponse> {
        let response;
        try {
            const axiosResponse = await Axios.post(url, payload, requestConfig);
            response = axiosResponse.data;
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
        return response;
    }

    static async get<TResponse>(url: string, requestConfig: RequestConfig): Promise<TResponse> {
        let response;
        try {
            const axiosResponse = await Axios.get(url, requestConfig);
            response = axiosResponse.data;
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
        return response;
    }

    static async delete(url: string, requestConfig: RequestConfig): Promise<void> {
        try {
            await Axios.delete(url, requestConfig);
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
    }

    static async put(url: string, requestConfig: RequestConfig): Promise<void> {
        try {
            await Axios.put(url, undefined, requestConfig);
        } catch (error) {
            AxiosAdapter.throwProcessedError(error as AxiosError);
        }
    }
}
