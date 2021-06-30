export default class FetchApiAdapter {
    static async makeApiRequest<TPayload, UResponse>(
        url: string,
        method: string,
        payload?: TPayload,
    ): Promise<UResponse> {
        const requestInit: RequestInit = {
            method,
            headers: { 'content-type': 'application/json' },
        };

        if (method === 'POST') {
            requestInit.body = JSON.stringify(payload);
        }

        return fetch(url, requestInit)
            .then((response) => {
                // An ok status is a status in the range 200 to 299, inclusive.
                if (!response.ok) {
                    throw new Error('Probably you are offline. Please connect with the internet');
                }
                return response.json();
            })
            .then((response) => {
                console.log('response', response);
                return response as unknown as UResponse;
            });
    }

    static async post<TPayload, UResponse>(url: string, payload: TPayload): Promise<UResponse> {
        return FetchApiAdapter.makeApiRequest<TPayload, UResponse>(url, 'POST', payload);
    }

    static async get<TResponse>(url: string): Promise<TResponse> {
        return FetchApiAdapter.makeApiRequest<void, TResponse>(url, 'GET');
    }

    static async delete(url: string): Promise<void> {
        return FetchApiAdapter.makeApiRequest<void, void>(url, 'DELETE');
    }
}
