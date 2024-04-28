import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import NativeStorage from '@/utils/NativeStorage';
import { FirecrackerError } from '@/domains/FirecrackerError';

export default class LeitnerSystemService {
    static async insertIntoLeitnerBox(vocabularyId: string): Promise<void> {
        try {
            await HttpHandler.post<undefined, void>(`/v1/leitner-systems/start/${vocabularyId}`, undefined);
            await Toast.present(
                `You just made a flashcard with this vocabulary. This word can be found in the ${MappedLeitnerBoxWithDays.BOX_1} box.`,
            );
            NativeStorage.setLeitnerBoxExistence(vocabularyId).finally();
        } catch (error) {
            await Toast.present((error as FirecrackerError).message);
        }
    }
}
