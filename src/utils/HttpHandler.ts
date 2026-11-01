import { AxiosRequestConfig } from 'axios';
import AxiosAdapter from '@/utils/AxiosAdapter';
import Platform from '@/utils/Platform';
import NativeStorage from '@/utils/NativeStorage';
import Config from '../../config.json';

export default class HttpHandler {
    private static readonly axiosAdapter = AxiosAdapter.getInstance();

    static async getRequestConfig(isPublic = false): Promise<AxiosRequestConfig> {
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

    static getCompleteUrl(url: string): string {
        return `${Config.server.apiPrefix}${url}`;
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload, isPublic = false): Promise<UResponse> {
        return HttpHandler.axiosAdapter.post<TPayload, UResponse>(
            HttpHandler.getCompleteUrl(url),
            payload,
            await HttpHandler.getRequestConfig(isPublic),
        );
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        return HttpHandler.axiosAdapter.get<TResponse>(
            HttpHandler.getCompleteUrl(url),
            await HttpHandler.getRequestConfig(),
        );
    }

    static async delete(url: string): Promise<void> {
        await HttpHandler.axiosAdapter.delete(HttpHandler.getCompleteUrl(url), await HttpHandler.getRequestConfig());
    }

    static async put(url: string): Promise<void> {
        await HttpHandler.axiosAdapter.put(HttpHandler.getCompleteUrl(url), await HttpHandler.getRequestConfig());
    }
}
