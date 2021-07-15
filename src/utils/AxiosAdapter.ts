import Axios, { AxiosError } from 'axios';
import MessageDB from '@/utils/MessageDB';

type RequestConfig = Record<string, unknown>;

export default class AxiosAdapter {
    static handleError(error: AxiosError): void {
        if (error.message === 'Network Error') {
            throw new Error(MessageDB.networkError);
        }
        if (Array.isArray(error.response?.data?.message)) {
            throw new Error(error.response?.data.message[0]);
        }
        if (error.response?.status === 500) {
            throw new Error(MessageDB.genericError);
        }
        throw new Error(error.response?.data.message);
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
            throw AxiosAdapter.handleError(error);
        }
        return response;
    }

    static async get<TResponse>(url: string, requestConfig: RequestConfig): Promise<TResponse> {
        let response;
        try {
            const axiosResponse = await Axios.get(url, requestConfig);
            response = axiosResponse.data;
        } catch (error) {
            throw AxiosAdapter.handleError(error);
        }
        return response;
    }

    static async delete(url: string, requestConfig: RequestConfig): Promise<void> {
        try {
            await Axios.delete(url, requestConfig);
        } catch (error) {
            throw AxiosAdapter.handleError(error);
        }
    }
}
