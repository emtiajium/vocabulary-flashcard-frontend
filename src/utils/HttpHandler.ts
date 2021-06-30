import { Device } from '@capacitor/device';
import AxiosAdapter from '@/utils/AxiosAdapter';
import FetchApiAdapter from '@/utils/FetchApiAdapter';
import Config from '../../config.json';

export default class HttpHandler {
    static async isWeb(): Promise<boolean> {
        const { platform } = await Device.getInfo();
        return platform === 'web';
    }

    static getCompleteUrl(url: string): string {
        return `${Config.server.apiPrefix}${url}`;
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload): Promise<UResponse> {
        let response: UResponse | void;
        if (await HttpHandler.isWeb()) {
            response = await AxiosAdapter.post(HttpHandler.getCompleteUrl(url), payload);
        } else {
            response = await FetchApiAdapter.post(url, payload);
        }
        return response as UResponse;
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        let response: TResponse | void;
        if (await HttpHandler.isWeb()) {
            response = await AxiosAdapter.get(HttpHandler.getCompleteUrl(url));
        } else {
            response = await FetchApiAdapter.get(url);
        }
        return response as TResponse;
    }

    static async delete(url: string): Promise<void> {
        if (await HttpHandler.isWeb()) {
            await AxiosAdapter.delete(HttpHandler.getCompleteUrl(url));
        } else {
            await FetchApiAdapter.delete(url);
        }
    }
}
