import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import NativeStorage from '@/utils/NativeStorage';
import { FirecrackerError } from '@/domains/FirecrackerError';

export default class LeitnerSystemService {
    /**
     * Returns whether the vocabulary actually became a flashcard, so callers can
     * keep the heart state and the celebration honest when the request fails.
     */
    static async insertIntoLeitnerBox(vocabularyId: string): Promise<boolean> {
        try {
            await HttpHandler.post<undefined, void>(`/v1/leitner-systems/start/${vocabularyId}`, undefined);
            await Toast.present(
                `You just made a flashcard with this vocabulary. This word can be found in the ${MappedLeitnerBoxWithDays.BOX_1} box.`,
                'success',
            );
            NativeStorage.setLeitnerBoxExistence(vocabularyId).finally();

            return true;
        } catch (error) {
            await Toast.present((error as FirecrackerError).message, 'error');

            return false;
        }
    }
}
