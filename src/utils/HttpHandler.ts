import AxiosAdapter from '@/utils/AxiosAdapter';
import GoogleAuthentication from '@/utils/GoogleAuthentication';
import Platform from '@/utils/Platform';
import Config from '../../config.json';

type RequestConfig = Record<string, unknown>;

export default class HttpHandler {
    static async getRequestConfig(isPublic = false): Promise<RequestConfig> {
        const { isAndroid, version, versionCode } = await Platform.getVersion();
        const requestConfig: RequestConfig = {
            'content-type': 'application/json',
            'X-Client-Id': `${isAndroid ? 'AndroidNativeApp' : 'WebApp'}`,
            'X-Version': version,
            'X-Version-Code': versionCode,
        };
        if (!isPublic) {
            requestConfig.Authorization = `Bearer ${await GoogleAuthentication.getToken()}`;
        }
        return { headers: requestConfig };
    }

    static getCompleteUrl(url: string): string {
        return `${Config.server.apiPrefix}${url}`;
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload, isPublic = false): Promise<UResponse> {
        return AxiosAdapter.post(
            HttpHandler.getCompleteUrl(url),
            payload,
            await HttpHandler.getRequestConfig(isPublic),
        );
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        return AxiosAdapter.get(HttpHandler.getCompleteUrl(url), await HttpHandler.getRequestConfig());
    }

    static async delete(url: string): Promise<void> {
        await AxiosAdapter.delete(HttpHandler.getCompleteUrl(url), await HttpHandler.getRequestConfig());
    }

    static async put(url: string): Promise<void> {
        await AxiosAdapter.put(HttpHandler.getCompleteUrl(url), await HttpHandler.getRequestConfig());
    }
}
