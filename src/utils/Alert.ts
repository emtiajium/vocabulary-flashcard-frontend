import { alertController } from '@ionic/vue';

type Handler = () => Promise<unknown>;

export default class Alert {
    static async presentAlertConfirm(
        header: string,
        message: string,
        proceedHandler: Handler,
        changedMindHandler: Handler = Promise.resolve,
    ): Promise<void> {
        const alert = await alertController.create({
            header,
            message,
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: async (): Promise<void> => {
                        await changedMindHandler();
                    },
                },
                {
                    text: 'Yes',
                    handler: async (): Promise<void> => {
                        await proceedHandler();
                    },
                },
            ],
        });

        await alert.present();
    }
}
