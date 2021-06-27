import { alertController } from '@ionic/vue';

type Handler = () => Promise<unknown>;

export default class Alert {
    static async presentAlertConfirm(header: string, message: string, handler: Handler) {
        const alert = await alertController.create({
            cssClass: 'custom-alert',
            header,
            message,
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                },
                {
                    text: 'Yes',
                    handler: async () => {
                        await handler();
                    },
                },
            ],
        });

        await alert.present();
    }
}
