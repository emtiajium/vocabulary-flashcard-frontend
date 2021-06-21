import { Storage } from '@capacitor/storage';
import NativeStorageKey from '@/domains/NativeStorageKey';
import User from '@/domains/User';

export default class NativeStorage {
    static async getByKey<T>(key: NativeStorageKey, type = 'JSON'): Promise<T> {
        const result = await Storage.get({ key });
        return type === 'JSON' ? JSON.parse(result.value as string) : result.value;
    }

    static async getCohortId(): Promise<string> {
        const user = await NativeStorage.getByKey<User>(NativeStorageKey.AUTHORIZED_USER);
        return user.cohortId as string;
    }

    static async setAuthorizedUser(user: User): Promise<void> {
        await Storage.set({
            key: NativeStorageKey.AUTHORIZED_USER,
            value: JSON.stringify({
                id: user?.id,
                cohortId: user?.cohortId,
                username: user?.username,
            }),
        });
    }
}
