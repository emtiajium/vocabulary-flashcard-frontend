import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { isBoolean, isString } from 'lodash';
import * as packageInfo from '../../package.json';

export default class Platform {
    private static isPlatformAndroid: null | boolean = null;

    private static versionCode: null | string = null;

    private static version: null | string = null;

    static async isAndroid(): Promise<boolean> {
        if (isBoolean(Platform.isPlatformAndroid)) {
            return Platform.isPlatformAndroid;
        }
        let isAndroid = false;
        try {
            const { platform } = await Device.getInfo();
            isAndroid = platform === 'android';
        } catch {
            isAndroid = false;
        }
        Platform.isPlatformAndroid = isAndroid;
        return isAndroid;
    }

    static async getVersion(): Promise<{ isAndroid: boolean; versionCode: string; version: string }> {
        if (isString(Platform.isPlatformAndroid) && isString(Platform.versionCode) && isString(Platform.version)) {
            return {
                isAndroid: Platform.isPlatformAndroid,
                versionCode: Platform.versionCode,
                version: Platform.version,
            };
        }

        let versionCode: string;
        let version: string;

        const isAndroid = await Platform.isAndroid();
        if (isAndroid) {
            const { build, version: androidVersion } = await App.getInfo();
            versionCode = build;
            version = androidVersion;
        } else {
            version = packageInfo.version;
            versionCode = 'NA';
        }

        return {
            isAndroid,
            versionCode,
            version,
        };
    }
}
