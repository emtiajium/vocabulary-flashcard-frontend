/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import GuessingGame from '@/views/vocab-read/GuessingGame.vue';
import NativeStorage from '@/utils/NativeStorage';
import { RandomlyChosenMeaningResponse } from '@/domains/RandomlyChosenMeaningResponse';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonPage: IonStub,
        IonContent: IonStub,
        IonRow: IonStub,
        IonCol: IonStub,
        IonTextarea: IonStub,
        IonButton: IonStub,
        IonCardSubtitle: IonStub,
        IonCardTitle: IonStub,
        IonCardHeader: IonStub,
        IonFab: IonStub,
        IonFabButton: IonStub,
        IonModal: IonStub,
        useBackButton: jest.fn(),
    };
});

jest.mock('swiper', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        init: jest.fn(),
        on: jest.fn(),
        destroy: jest.fn(),
        disable: jest.fn(),
    })),
}));

jest.mock('swiper/modules', () => ({ __esModule: true, Pagination: {} }));

jest.mock('@fortawesome/vue-fontawesome', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, FontAwesomeIcon: define({ template: '<i />' }) };
});

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
    __esModule: true,
    faCircleCheck: {},
    faLightbulb: {},
    faCircleArrowUp: {},
    faEye: {},
    faInfoCircle: {},
    faTriangleExclamation: {},
}));

jest.mock('@/views/shared/FirecrackerHeader.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div><slot /></div>' }) };
});

jest.mock('@/views/shared/Spinner.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/media/LottieAnimation.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ name: 'LottieAnimation', template: '<div class="lottie-stub" />' }) };
});

jest.mock('@/utils/Toast', () => ({ __esModule: true, default: { present: jest.fn() } }));

// The real handler pulls in the Google sign-in client, which needs DOM types the
// test tsconfig does not load.
jest.mock('@/utils/HttpHandler', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

jest.mock('@/utils/NativeStorage', () => ({
    __esModule: true,
    default: {
        setGuessingGameVocabularies: jest.fn(),
        removeGuessingGameVocabularies: jest.fn(),
        getGuessingGameVocabularies: jest.fn(),
    },
}));

interface GuessingGameVm {
    vocabularies: RandomlyChosenMeaningResponse[];
    givenAnswer: string;
    hasAnswerFeedback: boolean;
    answerFeedbackKey: number;
    isAnswerCorrect: boolean;
    answerFeedbackAnimation: Record<string, unknown>;
    isCompletionModalOpened: boolean;
    resultMessage: string;
    submitAnswer(vocabulary: RandomlyChosenMeaningResponse, index: number): void;
}

const nativeStorage = NativeStorage as unknown as {
    setGuessingGameVocabularies: jest.Mock;
    removeGuessingGameVocabularies: jest.Mock;
};

const vocabularies = (): RandomlyChosenMeaningResponse[] => [
    { meaning: 'The ability to understand and decide things quickly and well.', word: 'Acumen' },
    { meaning: 'Grasp (something) tightly', word: 'Clutch' },
];

const vm = (wrapper: VueWrapper): GuessingGameVm => wrapper.vm as unknown as GuessingGameVm;

/** Identifies which asset is driving the burst without comparing reactive proxies. */
const feedbackAnimationName = (wrapper: VueWrapper): string =>
    (vm(wrapper).answerFeedbackAnimation as { nm: string }).nm;

const mountedWrappers: VueWrapper[] = [];

const mountView = async (words: RandomlyChosenMeaningResponse[]): Promise<VueWrapper> => {
    // `attachTo` is required because the bounce animation looks the badges up with
    // `document.getElementsByClassName`, and `renderStubDefaultSlot` keeps the
    // slotted markup of the stubbed Ionic components.
    const wrapper = shallowMount(GuessingGame, {
        attachTo: document.body,
        global: { renderStubDefaultSlot: true },
    });
    vm(wrapper).vocabularies = words;
    await wrapper.vm.$nextTick();

    mountedWrappers.push(wrapper);

    return wrapper;
};

const answer = async (wrapper: VueWrapper, index: number, given: string): Promise<void> => {
    vm(wrapper).givenAnswer = given;
    vm(wrapper).submitAnswer(vm(wrapper).vocabularies[index], index);
    await wrapper.vm.$nextTick();
};

describe('Guessing game view (integration)', () => {
    beforeAll(() => {
        // jsdom does not implement media playback and logs a "not implemented" error.
        window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
        window.HTMLMediaElement.prototype.pause = jest.fn();
    });

    beforeEach(() => {
        nativeStorage.setGuessingGameVocabularies.mockResolvedValue(undefined);
        nativeStorage.removeGuessingGameVocabularies.mockResolvedValue(undefined);
    });

    afterEach(() => {
        while (mountedWrappers.length) {
            mountedWrappers.pop()?.unmount();
        }

        document.body.innerHTML = '';
    });

    describe('WHEN an answer is submitted', () => {
        it('SHOULD celebrate a correct guess with the answer-correct burst', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, '  acumen ');

            expect(vm(wrapper).resultMessage).toBe('Correct!');
            expect(vm(wrapper).isAnswerCorrect).toBe(true);
            expect(feedbackAnimationName(wrapper)).toBe('answer-correct');
            expect(vm(wrapper).hasAnswerFeedback).toBe(true);
            expect(vm(wrapper).answerFeedbackKey).toBe(1);
            expect(vm(wrapper).isCompletionModalOpened).toBe(false);
        });

        it('SHOULD nudge an incorrect guess with the answer-incorrect burst', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Nonsense');

            expect(vm(wrapper).resultMessage).toBe('Incorrect!');
            expect(vm(wrapper).isAnswerCorrect).toBe(false);
            expect(feedbackAnimationName(wrapper)).toBe('answer-incorrect');
            expect(vm(wrapper).answerFeedbackKey).toBe(1);
        });

        it('SHOULD replay the burst for every submission', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Nonsense');
            await answer(wrapper, 0, 'Acumen');

            expect(vm(wrapper).answerFeedbackKey).toBe(2);
            expect(feedbackAnimationName(wrapper)).toBe('answer-correct');
        });
    });

    describe('WHEN every word has been guessed', () => {
        it('SHOULD open the completion celebration instead of the per-answer burst', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Acumen');
            await answer(wrapper, 1, 'Clutch');

            expect(vm(wrapper).isCompletionModalOpened).toBe(true);
            expect(vm(wrapper).hasAnswerFeedback).toBe(false);
            expect(vm(wrapper).answerFeedbackKey).toBe(1);
            expect(nativeStorage.removeGuessingGameVocabularies).toHaveBeenCalled();
        });

        it('SHOULD not celebrate while some words are still unanswered', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Acumen');

            expect(vm(wrapper).isCompletionModalOpened).toBe(false);
            expect(vm(wrapper).hasAnswerFeedback).toBe(true);
        });
    });
});
