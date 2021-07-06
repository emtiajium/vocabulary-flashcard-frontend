import { Drivers, Storage } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import NativeStorageKey from '@/domains/NativeStorageKey';
import User from '@/domains/User';

let storage: Storage;

export default class NativeStorage {
    static async getStorage(): Promise<Storage> {
        await NativeStorage.createStorageIfNotExist();
        return storage;
    }

    static async createStorageIfNotExist(): Promise<void> {
        if (!storage) {
            // IndexedDB: Web app
            // SQLite: Native app
            storage = new Storage({
                // eslint-disable-next-line no-underscore-dangle
                driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
            });
            await storage.defineDriver(CordovaSQLiteDriver);
            await storage.create();
        }
    }

    static async getByKey<T>(key: NativeStorageKey): Promise<T> {
        return (await NativeStorage.getStorage()).get(key);
    }

    static async getAuthorizedUser(): Promise<User> {
        return NativeStorage.getByKey<User>(NativeStorageKey.AUTHORIZED_USER);
    }

    static async getUserId(): Promise<string> {
        const user = await NativeStorage.getAuthorizedUser();
        return user.id as string;
    }

    static async setAuthorizedUser(user: User): Promise<void> {
        await (
            await NativeStorage.getStorage()
        ).set(NativeStorageKey.AUTHORIZED_USER, {
            id: user?.id,
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
