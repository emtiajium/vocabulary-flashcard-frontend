import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import MessageDB from '@/utils/MessageDB';
import { Capacitor } from '@capacitor/core';
import Platform from '@/utils/Platform';
import NativeStorage from '@/utils/NativeStorage';
import Config from '../../config.json';

export default class HttpHandler {
    private static readonly sharedInstance = new HttpHandler();

    private readonly client: AxiosInstance;

    private constructor() {
        this.client = Axios.create({
            baseURL: Config.server.apiPrefix,
            // TODO use method from src/utils/Platform.ts
            withCredentials: !Capacitor.isNativePlatform(),
        });
    }

    static getInstance(): HttpHandler {
        return HttpHandler.sharedInstance;
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

    async axiosPost<TPayload, UResponse>(
        url: string,
        payload: TPayload,
        requestConfig: AxiosRequestConfig,
    ): Promise<UResponse> {
        try {
            const response = await this.client.post<UResponse>(url, payload, requestConfig);
            return response.data;
        } catch (error) {
            HttpHandler.throwProcessedError(error as AxiosError);
        }
    }

    async axiosGet<TResponse>(url: string, requestConfig: AxiosRequestConfig): Promise<TResponse> {
        try {
            const response = await this.client.get<TResponse>(url, requestConfig);
            return response.data;
        } catch (error) {
            HttpHandler.throwProcessedError(error as AxiosError);
        }
    }

    async axiosDelete(url: string, requestConfig: AxiosRequestConfig): Promise<void> {
        try {
            await this.client.delete(url, requestConfig);
        } catch (error) {
            HttpHandler.throwProcessedError(error as AxiosError);
        }
    }

    async axiosPut(url: string, requestConfig: AxiosRequestConfig): Promise<void> {
        try {
            await this.client.put(url, undefined, requestConfig);
        } catch (error) {
            HttpHandler.throwProcessedError(error as AxiosError);
        }
    }

    private async getRequestConfig(isPublic = false): Promise<AxiosRequestConfig> {
        const { isAndroid, version, versionCode } = await Platform.getVersion();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-Id': isAndroid ? 'AndroidNativeApp' : 'WebApp',
            'X-Version': String(version),
            'X-Version-Code': String(versionCode),
        };
        if (isAndroid && !isPublic) {
            headers.Authorization = `Bearer ${await NativeStorage.getAccessToken()}`;
        }
        if (!isAndroid) {
            delete headers.Authorization;
        }
        return { headers };
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload, isPublic = false): Promise<UResponse> {
        return HttpHandler.getInstance().axiosPost<TPayload, UResponse>(
            url,
            payload,
            await HttpHandler.getInstance().getRequestConfig(isPublic),
        );
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        return HttpHandler.getInstance().axiosGet<TResponse>(url, await HttpHandler.getInstance().getRequestConfig());
    }

    static async delete(url: string): Promise<void> {
        await HttpHandler.getInstance().axiosDelete(url, await HttpHandler.getInstance().getRequestConfig());
    }

    static async put(url: string): Promise<void> {
        await HttpHandler.getInstance().axiosPut(url, await HttpHandler.getInstance().getRequestConfig());
    }
}
