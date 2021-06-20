import { toastController } from '@ionic/vue';

export default class Toast {
    static async present(message: string): Promise<void> {
        const toast = await toastController.create({
            message,
            duration: 2000,
        });
        await toast.present();
    }
}
