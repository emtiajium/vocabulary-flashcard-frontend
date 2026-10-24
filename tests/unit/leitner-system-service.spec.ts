/**
 * @jest-environment jsdom
 */
import LeitnerSystemService from '@/utils/LeitnerSystemService';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import NativeStorage from '@/utils/NativeStorage';

jest.mock('@/utils/HttpHandler', () => ({ __esModule: true, default: { post: jest.fn() } }));

jest.mock('@/utils/Toast', () => ({ __esModule: true, default: { present: jest.fn() } }));

jest.mock('@/utils/NativeStorage', () => ({
    __esModule: true,
    default: { setLeitnerBoxExistence: jest.fn() },
}));

const http = HttpHandler as unknown as { post: jest.Mock };
const toast = Toast as unknown as { present: jest.Mock };
const nativeStorage = NativeStorage as unknown as { setLeitnerBoxExistence: jest.Mock };

const vocabularyId = '11111111-1111-4111-8111-111111111111';

describe('Leitner system service', () => {
    beforeEach(() => {
        http.post.mockResolvedValue(undefined);
        toast.present.mockResolvedValue(undefined);
        nativeStorage.setLeitnerBoxExistence.mockResolvedValue(undefined);
    });

    describe('WHEN a vocabulary is turned into a flashcard', () => {
        it('SHOULD report success and let the user know which box it landed in', async () => {
            const isCreated = await LeitnerSystemService.insertIntoLeitnerBox(vocabularyId);

            expect(isCreated).toBe(true);
            expect(http.post).toHaveBeenCalledWith(`/v1/leitner-systems/start/${vocabularyId}`, undefined);
            expect(toast.present).toHaveBeenCalledWith(expect.stringContaining('You just made a flashcard'));
            expect(nativeStorage.setLeitnerBoxExistence).toHaveBeenCalledWith(vocabularyId);
        });
    });

    describe('WHEN the request fails', () => {
        it('SHOULD report failure instead of pretending the flashcard exists', async () => {
            http.post.mockRejectedValue({ message: 'Something went wrong' });

            const isCreated = await LeitnerSystemService.insertIntoLeitnerBox(vocabularyId);

            expect(isCreated).toBe(false);
            expect(toast.present).toHaveBeenCalledWith('Something went wrong');
            expect(nativeStorage.setLeitnerBoxExistence).not.toHaveBeenCalled();
        });

        it('SHOULD not throw, so callers keep control of their own state', async () => {
            http.post.mockRejectedValue(new Error('boom'));

            await expect(LeitnerSystemService.insertIntoLeitnerBox(vocabularyId)).resolves.toBe(false);
        });
    });
});
