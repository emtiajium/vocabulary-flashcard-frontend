import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import MessageDB from '@/utils/MessageDB';
import { Capacitor } from '@capacitor/core';
import Platform from '@/utils/Platform';
import GoogleAuthentication from '@/utils/GoogleAuthentication';
import Config from '../../config.json';

type RetryConfig = {
    retry?: boolean;
};

export default class HttpHandler {
    private static readonly sharedInstance = new HttpHandler();

    private readonly client: AxiosInstance;

    private refreshPromise: Promise<void> | null = null;

    private constructor() {
        this.client = Axios.create({
            baseURL: Config.server.apiPrefix,
            // TODO use method from src/utils/Platform.ts
            withCredentials: !Capacitor.isNativePlatform(),
        });
        this.installWebRefreshInterceptor();
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

    installWebRefreshInterceptor(): void {
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const config = error.config as typeof error.config & RetryConfig;

                // Only handle authentication failures.
                if (
                    !config ||
                    ![401, 403].includes(error.response?.status as number) ||
                    config.retry ||
                    config.url?.includes('/v1/auth/refresh') ||
                    config.url?.includes('/v1/users')
                ) {
                    return Promise.reject(error);
                }

                // Prevent retry loops.
                config.retry = true;

                try {
                    // Only one refresh request at a time.
                    await this.refreshToken();

                    // Browser automatically includes new cookies.
                    return this.client.request(config);
                } catch {
                    // Refresh failed: user needs to sign in again.
                    return Promise.reject(error);
                }
            },
        );
    }

    private async refreshToken(): Promise<void> {
        if (!this.refreshPromise) {
            const isAndroid = await Platform.isAndroid();
            if (isAndroid) {
                this.refreshPromise = this.client
                    .post('/v1/auth/refresh', undefined, await this.getRequestConfig(false, 'REFRESH'))
                    .then((response) => {
                        GoogleAuthentication.setToken(response.data.accessToken, response.data.refreshToken);
                    })
                    .finally(() => {
                        this.refreshPromise = null;
                    });
            } else {
                this.refreshPromise = this.client
                    .post('/v1/auth/refresh')
                    .then(() => {
                        /** */
                    })
                    .finally(() => {
                        this.refreshPromise = null;
                    });
            }
            await this.refreshPromise;
        }
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

    private async getRequestConfig(
        isPublic = false,
        tokenType: 'ACCESS' | 'REFRESH' = 'ACCESS',
    ): Promise<AxiosRequestConfig> {
        const { isAndroid, version, versionCode } = await Platform.getVersion();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-Id': isAndroid ? 'AndroidNativeApp' : 'WebApp',
            'X-Version': String(version),
            'X-Version-Code': String(versionCode),
        };
        if (isAndroid && !isPublic) {
            headers.Authorization = `Bearer ${
                tokenType === 'ACCESS'
                    ? GoogleAuthentication.getToken().accessToken
                    : GoogleAuthentication.getToken().refreshToken
            }`;
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
