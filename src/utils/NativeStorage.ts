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

    static async getJwToken(): Promise<string> {
        const user = await NativeStorage.getAuthorizedUser();
        return user.jwToken as string;
    }

    static async setAuthorizedUser(user: User): Promise<void> {
        await (
            await NativeStorage.getStorage()
        ).set(NativeStorageKey.AUTHORIZED_USER, {
            jwToken: user?.jwToken,
            username: user?.username,
            name: user?.name,
            profilePictureUrl: user?.profilePictureUrl,
        });
    }

    static async removeAuthorizedUser(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.AUTHORIZED_USER);
    }

    static async resetAuthorizedUser(user: User): Promise<void> {
        await NativeStorage.removeAuthorizedUser();
        await NativeStorage.setAuthorizedUser(user);
    }

    static async setShouldReloadVocabularies(shouldReloadVocabularies: boolean): Promise<void> {
        await (
            await NativeStorage.getStorage()
        ).set(NativeStorageKey.SHOULD_RELOAD_VOCABULARIES, shouldReloadVocabularies);
    }

    static async getShouldReloadVocabularies(): Promise<boolean> {
        return NativeStorage.getByKey<boolean>(NativeStorageKey.SHOULD_RELOAD_VOCABULARIES);
    }

    static async isAuthenticated(): Promise<boolean> {
        const user = await NativeStorage.getAuthorizedUser();
        return user && Object.keys(user).length > 0;
    }
}
