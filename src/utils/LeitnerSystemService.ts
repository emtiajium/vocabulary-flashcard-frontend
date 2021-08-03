import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import NativeStorage from '@/utils/NativeStorage';

export default class LeitnerSystemService {
    static async insertIntoLeitnerBox(vocabularyId: string): Promise<void> {
        try {
            await HttpHandler.post<undefined, void>(`/v1/leitner-systems/start/${vocabularyId}`, undefined);
            await Toast.present(`You will find this vocabulary in the ${MappedLeitnerBoxWithDays.BOX_1} box.`);
            NativeStorage.setLeitnerBoxExistence(vocabularyId).finally();
        } catch (error) {
            await Toast.present(error.message);
        }
    }
}
