import { alertController } from '@ionic/vue';

type Handler = () => Promise<unknown>;

export default class Alert {
    static async presentAlertConfirm(
        header: string,
        message: string,
        proceedHandler: Handler,
        changedMindHandler: Handler = Promise.resolve.bind(Promise), // https://stackoverflow.com/questions/45210122/
        buttonLabels: Record<string, string> = {
            cancel: 'No',
            agree: 'Yes',
        },
    ): Promise<void> {
        const alert = await alertController.create({
            header,
            message,
            buttons: [
                {
                    text: buttonLabels.cancel,
                    role: 'cancel',
                    handler: async (): Promise<void> => {
                        await changedMindHandler();
                    },
                },
                {
                    text: buttonLabels.agree,
                    handler: async (): Promise<void> => {
                        await proceedHandler();
                    },
                },
            ],
        });

        await alert.present();
    }

    static async presentButtonLessAlert(header: string, message: string): Promise<void> {
        const alert = await alertController.create({
            header,
            message,
            buttons: [],
        });

        await alert.present();
    }
}
