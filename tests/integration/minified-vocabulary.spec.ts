/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import MinifiedVocabulary from '@/views/vocab-read/MinifiedVocabulary.vue';
import LeitnerSystemService from '@/utils/LeitnerSystemService';
import Vocabulary from '@/domains/Vocabulary';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonCard: IonStub,
        IonCardHeader: IonStub,
        IonCardTitle: IonStub,
        IonCardSubtitle: IonStub,
        IonCardContent: IonStub,
        IonButton: IonStub,
        IonLabel: IonStub,
        IonRow: IonStub,
    };
});

jest.mock('@fortawesome/vue-fontawesome', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, FontAwesomeIcon: define({ template: '<i />' }) };
});

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
    __esModule: true,
    faTrashAlt: {},
    faPencilAlt: {},
    faExpandAlt: {},
    faEllipsisH: {},
    faHeart: {},
}));

jest.mock('@fortawesome/free-regular-svg-icons', () => ({ __esModule: true, faHeart: {} }));

jest.mock('@/media/LottieAnimation.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ name: 'LottieAnimation', template: '<div class="lottie-stub" />' }) };
});

jest.mock('@/utils/Alert', () => ({ __esModule: true, default: { presentConfirm: jest.fn() } }));

// The real handler pulls in the Google sign-in client, which needs DOM types the
// test tsconfig does not load.
jest.mock('@/utils/HttpHandler', () => ({ __esModule: true, default: { delete: jest.fn() } }));

jest.mock('@/utils/Toast', () => ({ __esModule: true, default: { present: jest.fn() } }));

jest.mock('@/utils/LeitnerSystemService', () => ({
    __esModule: true,
    default: { insertIntoLeitnerBox: jest.fn() },
}));

interface FeedbackOrigin {
    top: number;
    left: number;
}

interface MinifiedVocabularyVm {
    disableBoxInsertionButton: boolean;
    flashcardFeedback: FeedbackOrigin | null;
    flashcardFeedbackKey: number;
    flashcardFeedbackStyle: Record<string, string>;
    insertIntoLeitnerBox(clickEvent: MouseEvent): Promise<void>;
    onFlashcardFeedbackComplete(): void;
}

const leitnerSystemService = LeitnerSystemService as unknown as { insertIntoLeitnerBox: jest.Mock };

const vm = (wrapper: VueWrapper): MinifiedVocabularyVm => wrapper.vm as unknown as MinifiedVocabularyVm;

/** A 40x40 control whose centre sits at (220, 120) in the viewport. */
const heartButton = (): HTMLElement =>
    ({
        getBoundingClientRect: (): DOMRect =>
            ({
                top: 100,
                left: 200,
                width: 40,
                height: 40,
                right: 240,
                bottom: 140,
                x: 200,
                y: 100,
                toJSON: (): Record<string, never> => ({}),
            } as DOMRect),
    } as unknown as HTMLElement);

const clickEvent = (target: HTMLElement): MouseEvent => ({ currentTarget: target } as unknown as MouseEvent);

let updateLeitnerBoxExistence: jest.Mock;

const mountView = (vocabulary: Partial<Vocabulary> = {}): VueWrapper => {
    updateLeitnerBoxExistence = jest.fn();

    return shallowMount(MinifiedVocabulary, {
        props: {
            vocabulary: { id: 'vocabulary-1', word: 'Debris', definitions: [], ...vocabulary },
            deleteVocabulary: jest.fn(),
            updateLeitnerBoxExistence,
        },
    });
};

describe('Minified vocabulary (integration)', () => {
    beforeEach(() => {
        leitnerSystemService.insertIntoLeitnerBox.mockResolvedValue(true);
    });

    describe('WHEN the heart is tapped and the flashcard is created', () => {
        it('SHOULD burst out of the tapped control', async () => {
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartButton()));

            expect(vm(wrapper).flashcardFeedback).toEqual({ top: 120, left: 220 });
            expect(vm(wrapper).flashcardFeedbackKey).toBe(1);
            expect(vm(wrapper).flashcardFeedbackStyle).toEqual({ top: '120px', left: '220px' });
            expect(vm(wrapper).disableBoxInsertionButton).toBe(false);
        });

        it('SHOULD tell the list that the vocabulary lives in a box now', async () => {
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartButton()));

            expect(updateLeitnerBoxExistence).toHaveBeenCalledWith('vocabulary-1');
        });

        it('SHOULD replay the burst for each word', async () => {
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartButton()));
            vm(wrapper).onFlashcardFeedbackComplete();
            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartButton()));

            expect(vm(wrapper).flashcardFeedbackKey).toBe(2);
        });

        it('SHOULD drop the overlay once the burst has finished', async () => {
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartButton()));
            vm(wrapper).onFlashcardFeedbackComplete();

            expect(vm(wrapper).flashcardFeedback).toBeNull();
            expect(vm(wrapper).flashcardFeedbackStyle).toEqual({});
        });
    });

    describe('WHEN the flashcard could not be created', () => {
        it('SHOULD celebrate nothing and leave the heart alone', async () => {
            leitnerSystemService.insertIntoLeitnerBox.mockResolvedValue(false);
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartButton()));

            expect(vm(wrapper).flashcardFeedback).toBeNull();
            expect(vm(wrapper).flashcardFeedbackKey).toBe(0);
            expect(updateLeitnerBoxExistence).not.toHaveBeenCalled();
            expect(vm(wrapper).disableBoxInsertionButton).toBe(false);
        });
    });
});
