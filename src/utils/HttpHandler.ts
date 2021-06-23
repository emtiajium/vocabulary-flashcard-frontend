import Axios, { AxiosError } from 'axios';
import Config from '../../config.json';

export default class HttpHandler {
    static handleError(error: AxiosError) {
        if (Array.isArray(error?.response?.data?.message)) {
            throw new Error(error.response?.data.message[0]);
        }
        throw new Error(error.response?.data.message);
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload): Promise<UResponse | void> {
        let response;
        try {
            const axiosResponse = await Axios.post(`${Config.server.apiPrefix}${url}`, payload, {
                headers: { 'content-type': 'application/json' },
            });
            response = axiosResponse.data;
        } catch (error) {
            throw HttpHandler.handleError(error);
        }
        return response;
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        let response;
        try {
            const axiosResponse = await Axios.get(`${Config.server.apiPrefix}${url}`, {
                headers: { 'content-type': 'application/json' },
            });
            response = axiosResponse.data;
        } catch (error) {
            throw HttpHandler.handleError(error);
        }
        return response;
    }
}
