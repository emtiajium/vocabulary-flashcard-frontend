export default interface BackButtonUnsubscribeHandler {
    unregister: () => void | Promise<void>;
}
