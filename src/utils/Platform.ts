import { Device } from '@capacitor/device';

export default class Platform {
    static async isAndroid(): Promise<boolean> {
        let isAndroid = false;
        try {
            const { platform } = await Device.getInfo();
            isAndroid = platform === 'android';
        } catch {
            isAndroid = false;
        }
        return isAndroid;
    }
}
