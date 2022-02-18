import { Drivers, Storage } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import NativeStorageKey from '@/domains/NativeStorageKey';
import User from '@/domains/User';
import Vocabulary from '@/domains/Vocabulary';
import Sort from '@/domains/Sort';
import Platform from '@/utils/Platform';

let storage: Storage;

export default class NativeStorage {
    static async getStorage(): Promise<Storage> {
        await NativeStorage.createStorageIfNotExist();
        return storage;
    }

    static async createStorageIfNotExist(): Promise<void> {
        if (!storage) {
            const driver = [];
            const isAndroid = await Platform.isAndroid();
            if (isAndroid) {
                // eslint-disable-next-line no-underscore-dangle
                driver.push(CordovaSQLiteDriver._driver);
            } else {
                driver.push(Drivers.IndexedDB);
            }
            storage = new Storage({
                driverOrder: driver,
            });
            if (isAndroid) {
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

    static async setUpdatedVocabulary(vocabulary: Vocabulary): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.UPDATED_VOCABULARY, vocabulary);
    }

    static async removeUpdatedVocabulary(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.UPDATED_VOCABULARY);
    }

    static async getUpdatedVocabulary(): Promise<Vocabulary> {
        return NativeStorage.getByKey<Vocabulary>(NativeStorageKey.UPDATED_VOCABULARY);
    }

    static async isAuthenticated(): Promise<boolean> {
        const user = await NativeStorage.getAuthorizedUser();
        return user && Object.keys(user).length > 0;
    }

    static async setThemeMode(mode: string): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.THEME_MODE, mode);
    }

    static async getThemeMode(): Promise<string> {
        return NativeStorage.getByKey<string>(NativeStorageKey.THEME_MODE);
    }

    static async setLeitnerBoxExistence(vocabularyId: string): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.SET_LEITNER_BOX_EXISTENCE, vocabularyId);
    }

    static async removeLeitnerBoxExistence(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.SET_LEITNER_BOX_EXISTENCE);
    }

    static async getLeitnerBoxExistence(): Promise<string> {
        return NativeStorage.getByKey<string>(NativeStorageKey.SET_LEITNER_BOX_EXISTENCE);
    }

    static async setVocabSort(sort: Sort): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.VOCAB_SORT, sort);
    }

    static async getVocabSort(): Promise<Sort> {
        return NativeStorage.getByKey<Sort>(NativeStorageKey.VOCAB_SORT);
    }

    static async setShouldReloadLeitnerItems(): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.SHOULD_RELOAD_LEITNER_ITEMS, true);
    }

    static async getShouldReloadLeitnerItems(): Promise<boolean> {
        return NativeStorage.getByKey<boolean>(NativeStorageKey.SHOULD_RELOAD_LEITNER_ITEMS);
    }

    static async removeShouldReloadLeitnerItems(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.SHOULD_RELOAD_LEITNER_ITEMS);
    }
}
