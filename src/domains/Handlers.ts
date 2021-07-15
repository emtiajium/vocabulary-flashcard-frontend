export interface BackButtonUnsubscribeHandler {
    unregister: () => void | Promise<void>;
}

export type ProcessNextHandler = () => void | Promise<void>;
