import { alertController } from '@ionic/vue';

type Handler = () => Promise<unknown>;

export default class Alert {
    static async presentAlertConfirm(header: string, message: string, proceedHandler: Handler): Promise<void> {
        const alert = await alertController.create({
            header,
            message,
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
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
