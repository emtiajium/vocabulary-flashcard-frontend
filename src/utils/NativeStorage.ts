import { Drivers, Storage } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import NativeStorageKey from '@/domains/NativeStorageKey';
import User from '@/domains/User';
import Vocabulary from '@/domains/Vocabulary';
import Platform from '@/utils/Platform';
import VocabSettings from '@/domains/VocabSettings';
import { CachedRandomlyChosenMeaningResponse } from '@/domains/RandomlyChosenMeaningResponse';

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

    static async setAuthorizedUser(user: User): Promise<void> {
        await (
            await NativeStorage.getStorage()
        ).set(NativeStorageKey.AUTHORIZED_USER, {
            username: user?.username,
            name: user?.name,
            profilePictureUrl: user?.profilePictureUrl,
        });
    }

    static async removeAuthorizedUser(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.AUTHORIZED_USER);
    }

    static getJwToken(): Promise<string> {
        return NativeStorage.getByKey<string>(NativeStorageKey.JWT);
    }

    static async setJwToken(jwToken: string): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.JWT, jwToken);
    }

    static async removeJwToken(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.JWT);
    }

    static async setShouldReloadVocabularies(shouldReloadVocabularies: boolean): Promise<void> {
        await (
            await NativeStorage.getStorage()
        ).set(NativeStorageKey.SHOULD_RELOAD_VOCABULARIES, shouldReloadVocabularies);
    }

    static getShouldReloadVocabularies(): Promise<boolean> {
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

    static async setLeitnerBoxExistence(vocabularyId: string): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.SET_LEITNER_BOX_EXISTENCE, vocabularyId);
    }

    static async removeLeitnerBoxExistence(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.SET_LEITNER_BOX_EXISTENCE);
    }

    static getLeitnerBoxExistence(): Promise<string> {
        return NativeStorage.getByKey<string>(NativeStorageKey.SET_LEITNER_BOX_EXISTENCE);
    }

    static async setVocabSettings(vocabSettings: VocabSettings): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.VOCAB_SETTINGS, vocabSettings);
    }

    static getVocabSettings(): Promise<VocabSettings> {
        return NativeStorage.getByKey<VocabSettings>(NativeStorageKey.VOCAB_SETTINGS);
    }

    static async setShouldReloadLeitnerItems(): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.SHOULD_RELOAD_LEITNER_ITEMS, true);
    }

    static getShouldReloadLeitnerItems(): Promise<boolean> {
        return NativeStorage.getByKey<boolean>(NativeStorageKey.SHOULD_RELOAD_LEITNER_ITEMS);
    }

    static async removeShouldReloadLeitnerItems(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.SHOULD_RELOAD_LEITNER_ITEMS);
    }

    static async setGoodBye(): Promise<void> {
        await (await NativeStorage.getStorage()).set(NativeStorageKey.GOOD_BYE, 'okay!');
    }

    static getGoodBye(): Promise<string> {
        return NativeStorage.getByKey<string>(NativeStorageKey.GOOD_BYE);
    }

    static async removeGoodBye(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.GOOD_BYE);
    }

    static getGuessingGameVocabularies(): Promise<CachedRandomlyChosenMeaningResponse> {
        return NativeStorage.getByKey<CachedRandomlyChosenMeaningResponse>(NativeStorageKey.GUESSING_GAME_VOCABULARIES);
    }

    static async setGuessingGameVocabularies(
        cachedRandomlyChosenMeaningResponse: CachedRandomlyChosenMeaningResponse,
    ): Promise<void> {
        await (
            await NativeStorage.getStorage()
        ).set(NativeStorageKey.GUESSING_GAME_VOCABULARIES, cachedRandomlyChosenMeaningResponse);
    }

    static async removeGuessingGameVocabularies(): Promise<void> {
        await (await NativeStorage.getStorage()).remove(NativeStorageKey.GUESSING_GAME_VOCABULARIES);
    }
}
