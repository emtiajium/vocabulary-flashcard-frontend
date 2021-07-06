import AxiosAdapter from '@/utils/AxiosAdapter';
import NativeStorage from '@/utils/NativeStorage';
import Config from '../../config.json';

export default class HttpHandler {
    static async getRequestConfig(): Promise<Record<string, unknown>> {
        return {
            headers: { 'content-type': 'application/json', 'X-User-Id': await NativeStorage.getUserId() },
        };
    }

    static getCompleteUrl(url: string): string {
        return `${Config.server.apiPrefix}${url}`;
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload): Promise<UResponse> {
        return AxiosAdapter.post(HttpHandler.getCompleteUrl(url), payload, await HttpHandler.getRequestConfig());
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        return AxiosAdapter.get(HttpHandler.getCompleteUrl(url), await HttpHandler.getRequestConfig());
    }

    static async delete(url: string): Promise<void> {
        await AxiosAdapter.delete(HttpHandler.getCompleteUrl(url), await HttpHandler.getRequestConfig());
    }
}
