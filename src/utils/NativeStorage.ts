import { Drivers, Storage } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import NativeStorageKey from '@/domains/NativeStorageKey';
import User from '@/domains/User';
import { Device } from '@capacitor/device';

let storage: Storage;

export default class NativeStorage {
    static async getStorage(): Promise<Storage> {
        await NativeStorage.createStorageIfNotExist();
        return storage;
    }

    static async createStorageIfNotExist(): Promise<void> {
        if (!storage) {
            const driver = [];
            const { platform } = await Device.getInfo();
            if (platform !== 'web') {
                // eslint-disable-next-line no-underscore-dangle
                driver.push(CordovaSQLiteDriver._driver);
            } else {
                driver.push(Drivers.IndexedDB);
            }
            storage = new Storage({
                driverOrder: driver,
            });
            if (platform !== 'web') {
                await storage.defineDriver(CordovaSQLiteDriver);
            }
            await storage.create();
        }
    }

    static async getByKey<T>(key: NativeStorageKey): Promise<T> {
        return (await NativeStorage.getStorage()).get(key);
    }

    static async getAuthorizedUser(): Promise<User> {
        return NativeStorage.getByKey<User>(NativeStorageKey.AUTHORIZED_USER);
    }

    static async getJwtToken(): Promise<string> {
        const user = await NativeStorage.getAuthorizedUser();
        return user.jwToken as string;
    }

    static async setAuthorizedUser(user: User): Promise<void> {
        await (
            await NativeStorage.getStorage()
        ).set(NativeStorageKey.AUTHORIZED_USER, {
            jwToken: user?.jwToken,
            username: user?.username,
            firstname: user?.firstname,
            lastname: user?.lastname,
            profilePictureUrl: user?.profilePictureUrl,
        });
    }

    static async removeAuthorizedUser(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.AUTHORIZED_USER);
    }
}
