import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import MessageDB from '@/utils/MessageDB';
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
            withCredentials: true,
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
        if (errorResponse?.status === 401) {
            throw Object.assign(new Error('Unauthorized'), {
                status: 401,
            });
        }
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
                if (await Platform.isAndroid()) {
                    return Promise.reject(error);
                }

                const config = error.config as typeof error.config & RetryConfig;

                const isLoginRequest = config?.url === '/v1/users' && config?.method?.toLowerCase() === 'post';

                if (
                    !config ||
                    error.response?.status !== 401 ||
                    config.retry ||
                    config.url?.includes('/v1/auth/refresh') ||
                    isLoginRequest
                ) {
                    return Promise.reject(error);
                }

                // Prevent retry loops.
                config.retry = true;

                try {
                    // Only one refresh request at a time.
                    await this.performRefresh();

                    // Browser automatically includes new cookies.
                    return this.client.request(config);
                } catch {
                    // Refresh failed: user needs to sign in again.
                    return Promise.reject(error);
                }
            },
        );
    }

    private async performRefresh(): Promise<void> {
        if (!this.refreshPromise) {
            this.refreshPromise = this.client
                .post('/v1/auth/refresh', undefined, await this.getRequestConfig())
                .then((response) => {
                    void response;
                })
                .finally(() => {
                    this.refreshPromise = null;
                });
        }
        await this.refreshPromise;
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

    private async getRequestConfig(): Promise<AxiosRequestConfig> {
        const { isAndroid, version, versionCode } = await Platform.getVersion();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-Id': isAndroid ? 'AndroidNativeApp' : 'WebApp',
            'X-Version': String(version),
            'X-Version-Code': String(versionCode),
        };
        if (isAndroid) {
            headers.Authorization = `Bearer ${await GoogleAuthentication.getToken()}`;
        }
        return { headers };
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload): Promise<UResponse> {
        return HttpHandler.getInstance().axiosPost<TPayload, UResponse>(
            url,
            payload,
            await HttpHandler.getInstance().getRequestConfig(),
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
