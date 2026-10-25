import { alertController } from '@ionic/vue';

type Handler = () => Promise<unknown>;

interface ConfirmAlertOptions {
    /** The question being asked. Alerts here rarely need a title as well. */
    message: string;
    header?: string;
    /** Text for the button that goes ahead. Defaults to "Yes". */
    confirmLabel?: string;
    /** Text for the button that backs out. Defaults to "No". */
    cancelLabel?: string;
    /**
     * Set when going ahead destroys or discards something. It colours the
     * confirm button as dangerous, and Ionic reports it as the alert's
     * dismissing role, so the action never reads like the safe one.
     */
    destructive?: boolean;
    onConfirm: Handler;
    /** Runs when the user backs out. Omit it when there is nothing to undo. */
    onCancel?: Handler;
}

export default class Alert {
    /**
     * Asks a question and runs one of two handlers.
     *
     * Prefer this over `window.confirm`, which cannot be styled, is not
     * translated, and blocks the whole app.
     */
    static async presentConfirm({
        message,
        header,
        confirmLabel = 'Yes',
        cancelLabel = 'No',
        destructive = false,
        onConfirm,
        onCancel,
    }: ConfirmAlertOptions): Promise<void> {
        const alert = await alertController.create({
            // Styling hook: the alert renders outside the app root, so the
            // stylesheet reaches it by this class.
            cssClass: 'firecracker-alert',
            header,
            message,
            // Ionic names the dialog from the header, and these alerts put the question
            // in the message instead, so without this the dialog is announced unnamed.
            // The message stays the description. A header, when given, wins: Ionic then
            // points `aria-labelledby` at it.
            htmlAttributes: { 'aria-label': header ?? 'Please confirm' },
            buttons: [
                {
                    text: cancelLabel,
                    // Ionic keeps this button out of the destructive path and
                    // dismisses the alert with role "cancel" when it is tapped.
                    role: 'cancel',
                    handler: async (): Promise<void> => {
                        await onCancel?.();
                    },
                },
                {
                    text: confirmLabel,
                    role: destructive ? 'destructive' : undefined,
                    handler: async (): Promise<void> => {
                        await onConfirm();
                    },
                },
            ],
        });

        await alert.present();
    }
}
