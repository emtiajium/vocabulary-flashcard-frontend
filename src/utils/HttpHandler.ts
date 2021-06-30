import AxiosAdapter from '@/utils/AxiosAdapter';
import Config from '../../config.json';

export default class HttpHandler {
    static getCompleteUrl(url: string): string {
        return `${Config.server.apiPrefix}${url}`;
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload): Promise<UResponse> {
        return AxiosAdapter.post(HttpHandler.getCompleteUrl(url), payload);
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        return AxiosAdapter.get(HttpHandler.getCompleteUrl(url));
    }

    static async delete(url: string): Promise<void> {
        await AxiosAdapter.delete(HttpHandler.getCompleteUrl(url));
    }
}
