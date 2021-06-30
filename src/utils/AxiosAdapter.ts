import Axios, { AxiosError } from 'axios';

export default class AxiosAdapter {
    static handleError(error: AxiosError) {
        if (Array.isArray(error?.response?.data?.message)) {
            throw new Error(error.response?.data.message[0]);
        }
        throw new Error(error.response?.data.message);
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload): Promise<UResponse> {
        let response;
        try {
            const axiosResponse = await Axios.post(url, payload, {
                headers: { 'content-type': 'application/json' },
            });
            response = axiosResponse.data;
        } catch (error) {
            throw AxiosAdapter.handleError(error);
        }
        return response;
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        let response;
        try {
            const axiosResponse = await Axios.get(url, {
                headers: { 'content-type': 'application/json' },
            });
            response = axiosResponse.data;
        } catch (error) {
            throw AxiosAdapter.handleError(error);
        }
        return response;
    }

    static async delete(url: string): Promise<void> {
        try {
            await Axios.delete(url, {
                headers: { 'content-type': 'application/json' },
            });
        } catch (error) {
            throw AxiosAdapter.handleError(error);
        }
    }
}
