import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';

export default class LeitnerBoxItem {
    vocabularyId: string;

    word: string;

    static async insertIntoLeitnerBox(vocabularyId: string): Promise<void> {
        try {
            await HttpHandler.post<undefined, void>(`/v1/leitner-systems/start/${vocabularyId}`, undefined);
            await Toast.present(`You will find this vocabulary in the ${MappedLeitnerBoxWithDays.BOX_1} box.`);
        } catch (error) {
            await Toast.present(error.message);
        }
    }
}
