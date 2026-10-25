/**
 * @jest-environment jsdom
 */
import { shallowMount, VueWrapper } from '@vue/test-utils';
import GuessingGame from '@/views/vocab-read/GuessingGame.vue';
import NativeStorage from '@/utils/NativeStorage';
import HttpHandler from '@/utils/HttpHandler';
import { RandomlyChosenMeaningResponse } from '@/domains/RandomlyChosenMeaningResponse';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonPage: IonStub,
        IonContent: IonStub,
        IonTextarea: IonStub,
        IonButton: IonStub,
        IonCardSubtitle: IonStub,
        IonChip: IonStub,
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
        slideTo: jest.fn(),
    })),
}));

jest.mock('@fortawesome/vue-fontawesome', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, FontAwesomeIcon: define({ template: '<i />' }) };
});

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
    __esModule: true,
    faCircleCheck: {},
    faPlus: {},
    faInfoCircle: {},
    faTriangleExclamation: {},
}));

jest.mock('@/views/shared/FirecrackerHeader.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div><slot /></div>' }) };
});

jest.mock('@/views/shared/Spinner.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div class="spinner-stub" />' }) };
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
    givenAnswers: string[];
    revealedIndex: number | null;
    swiper: unknown;
    activeIndex: number;
    correctAnswerCount: number;
    answeredCount: number;
    progressPercent: number;
    scorePulseKey: number;
    failedMessage: string;
    isLoading: boolean;
    showGame: boolean;
    hasAnswerFeedback: boolean;
    answerFeedbackKey: number;
    isAnswerCorrect: boolean;
    answerFeedbackAnimation: Record<string, unknown>;
    isCompletionModalOpened: boolean;
    setVocabularies(vocabularies: RandomlyChosenMeaningResponse[]): void;
    submitAnswer(vocabulary: RandomlyChosenMeaningResponse, index: number): void;
    onGivingAnswer(answer: string, index: number): void;
    hasDraft(index: number): boolean;
    reveal(index: number): void;
    isRevealed(index: number): boolean;
    canReveal(vocabulary: RandomlyChosenMeaningResponse, index: number): boolean;
    feedbackClass(vocabulary: RandomlyChosenMeaningResponse, index: number): string;
    railClass(vocabulary: RandomlyChosenMeaningResponse, index: number): Record<string, boolean>;
    railStateLabel(vocabulary: RandomlyChosenMeaningResponse, index: number): string;
    initSwiper(): void;
    onSlideChange(index: number): void;
    goToSlide(index: number): void;
    clean(): void;
}

const nativeStorage = NativeStorage as unknown as {
    setGuessingGameVocabularies: jest.Mock;
    removeGuessingGameVocabularies: jest.Mock;
};

const httpPost = (HttpHandler as unknown as { post: jest.Mock }).post;

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
    // `renderStubDefaultSlot` keeps the slotted markup of the stubbed Ionic components.
    const wrapper = shallowMount(GuessingGame, { global: { renderStubDefaultSlot: true } });
    vm(wrapper).isLoading = false;
    vm(wrapper).setVocabularies(words);
    await wrapper.vm.$nextTick();

    mountedWrappers.push(wrapper);

    return wrapper;
};

/** Types into the field the way the view does, then presses Check. */
const answer = async (wrapper: VueWrapper, index: number, given: string): Promise<void> => {
    vm(wrapper).onGivingAnswer(given, index);
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
        httpPost.mockResolvedValue(undefined);
    });

    afterEach(() => {
        while (mountedWrappers.length) {
            mountedWrappers.pop()?.unmount();
        }

        document.body.innerHTML = '';
    });

    describe('WHEN a round is prepared', () => {
        it('SHOULD start with one empty draft per word', async () => {
            const wrapper = await mountView(vocabularies());

            expect(vm(wrapper).showGame).toBe(true);
            expect(vm(wrapper).givenAnswers).toEqual(['', '']);
            expect(vm(wrapper).hasDraft(0)).toBe(false);
        });

        it('SHOULD keep the answer of a word that was already guessed', async () => {
            const wrapper = await mountView([{ meaning: '…', word: 'Acumen', isCorrect: true }, vocabularies()[1]]);

            expect(vm(wrapper).givenAnswers).toEqual(['Acumen', '']);
            expect(vm(wrapper).correctAnswerCount).toBe(1);
        });

        it('SHOULD report progress as the share of words dealt with', async () => {
            const wrapper = await mountView(vocabularies());

            expect(vm(wrapper).progressPercent).toBe(0);

            await answer(wrapper, 0, 'Nonsense');

            expect(vm(wrapper).answeredCount).toBe(1);
            expect(vm(wrapper).progressPercent).toBe(50);
        });
    });

    describe('WHEN an answer is submitted', () => {
        it('SHOULD celebrate a correct guess with the answer-correct burst', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, '  acumen ');

            expect(vm(wrapper).vocabularies[0].isCorrect).toBe(true);
            expect(vm(wrapper).correctAnswerCount).toBe(1);
            expect(vm(wrapper).isAnswerCorrect).toBe(true);
            expect(feedbackAnimationName(wrapper)).toBe('answer-correct');
            expect(vm(wrapper).hasAnswerFeedback).toBe(true);
            expect(vm(wrapper).answerFeedbackKey).toBe(1);
            expect(vm(wrapper).isCompletionModalOpened).toBe(false);
        });

        it('SHOULD nudge an incorrect guess with the answer-incorrect burst', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Nonsense');

            expect(vm(wrapper).vocabularies[0].isCorrect).toBe(false);
            expect(vm(wrapper).correctAnswerCount).toBe(0);
            expect(vm(wrapper).isAnswerCorrect).toBe(false);
            expect(feedbackAnimationName(wrapper)).toBe('answer-incorrect');
            expect(vm(wrapper).answerFeedbackKey).toBe(1);
        });

        it('SHOULD ignore an empty answer', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, '   ');

            expect(vm(wrapper).vocabularies[0].isCorrect).toBeUndefined();
            expect(vm(wrapper).hasAnswerFeedback).toBe(false);
        });

        it('SHOULD replay the burst for every submission', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Nonsense');
            await answer(wrapper, 0, 'Acumen');

            expect(vm(wrapper).answerFeedbackKey).toBe(2);
            expect(feedbackAnimationName(wrapper)).toBe('answer-correct');
        });

        it('SHOULD pulse the score only when the total grows', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Nonsense');
            expect(vm(wrapper).scorePulseKey).toBe(0);

            await answer(wrapper, 0, 'Acumen');
            expect(vm(wrapper).scorePulseKey).toBe(1);

            await answer(wrapper, 0, 'Acumen');
            expect(vm(wrapper).scorePulseKey).toBe(1);
        });
    });

    describe('WHEN a word is left unanswered', () => {
        it('SHOULD offer to reveal the answer', async () => {
            const wrapper = await mountView(vocabularies());

            expect(vm(wrapper).canReveal(vm(wrapper).vocabularies[0], 0)).toBe(true);

            vm(wrapper).reveal(0);

            expect(vm(wrapper).isRevealed(0)).toBe(true);
            expect(vm(wrapper).canReveal(vm(wrapper).vocabularies[0], 0)).toBe(false);
        });

        it('SHOULD announce the word once it has been revealed', async () => {
            const wrapper = await mountView(vocabularies());
            await answer(wrapper, 0, 'Nonsense');

            expect(vm(wrapper).feedbackClass(vm(wrapper).vocabularies[0], 0)).toBe('is-incorrect');

            vm(wrapper).reveal(0);

            expect(vm(wrapper).feedbackClass(vm(wrapper).vocabularies[0], 0)).toBe('is-revealed');
            expect(vm(wrapper).railStateLabel(vm(wrapper).vocabularies[0], 0)).toBe(
                'answered incorrectly, answer shown',
            );
        });

        it('SHOULD offer to show the answer again after leaving the word and coming back', async () => {
            const wrapper = await mountView(vocabularies());
            vm(wrapper).reveal(0);

            expect(vm(wrapper).isRevealed(0)).toBe(true);

            // move to the next word and back again
            vm(wrapper).onSlideChange(1);
            vm(wrapper).onSlideChange(0);

            expect(vm(wrapper).activeIndex).toBe(0);
            expect(vm(wrapper).isRevealed(0)).toBe(false);
            expect(vm(wrapper).canReveal(vm(wrapper).vocabularies[0], 0)).toBe(true);
            expect(vm(wrapper).feedbackClass(vm(wrapper).vocabularies[0], 0)).toBe('is-neutral');
        });

        it('SHOULD never reveal a word that is already correct', async () => {
            const wrapper = await mountView(vocabularies());
            await answer(wrapper, 0, 'Acumen');

            expect(vm(wrapper).canReveal(vm(wrapper).vocabularies[0], 0)).toBe(false);
            expect(vm(wrapper).feedbackClass(vm(wrapper).vocabularies[0], 0)).toBe('is-correct');
        });
    });

    describe('WHEN the rail describes the round', () => {
        it('SHOULD mark each word with how it went', async () => {
            const wrapper = await mountView(vocabularies());
            await answer(wrapper, 0, 'Acumen');
            await answer(wrapper, 1, 'Nonsense');

            expect(vm(wrapper).railClass(vm(wrapper).vocabularies[0], 0)).toMatchObject({ 'is-correct': true });
            expect(vm(wrapper).railClass(vm(wrapper).vocabularies[1], 1)).toMatchObject({ 'is-incorrect': true });
            expect(vm(wrapper).railStateLabel(vm(wrapper).vocabularies[0], 0)).toBe('answered correctly');
            expect(vm(wrapper).railStateLabel(vm(wrapper).vocabularies[1], 1)).toBe('answered incorrectly');
        });

        it('SHOULD describe words that are still waiting', async () => {
            const wrapper = await mountView(vocabularies());

            expect(vm(wrapper).railStateLabel(vm(wrapper).vocabularies[0], 0)).toBe('current word, not answered yet');
            expect(vm(wrapper).railStateLabel(vm(wrapper).vocabularies[1], 1)).toBe('not answered yet');
        });

        it('SHOULD jump to a word when its step is selected', async () => {
            const wrapper = await mountView(vocabularies());
            vm(wrapper).initSwiper();

            vm(wrapper).goToSlide(1);

            expect((vm(wrapper).swiper as unknown as { slideTo: jest.Mock }).slideTo).toHaveBeenCalledWith(1);
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

        it('SHOULD tell the backend the round is over, so the next visit is a new game', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Acumen');
            await answer(wrapper, 1, 'Clutch');

            expect(httpPost).toHaveBeenCalledWith('/v1/vocabularies/definitions/random-search/complete', undefined);
        });

        it('SHOULD not report the round over while some words are still unanswered', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Acumen');

            expect(httpPost).not.toHaveBeenCalledWith('/v1/vocabularies/definitions/random-search/complete', undefined);
        });

        it('SHOULD not celebrate while some words are still unanswered', async () => {
            const wrapper = await mountView(vocabularies());

            await answer(wrapper, 0, 'Acumen');

            expect(vm(wrapper).isCompletionModalOpened).toBe(false);
            expect(vm(wrapper).hasAnswerFeedback).toBe(true);
        });
    });

    describe('WHEN the view is left', () => {
        it('SHOULD reset the round', async () => {
            const wrapper = await mountView(vocabularies());
            await answer(wrapper, 0, 'Acumen');

            vm(wrapper).clean();

            expect(vm(wrapper).vocabularies).toEqual([]);
            expect(vm(wrapper).givenAnswers).toEqual([]);
            expect(vm(wrapper).correctAnswerCount).toBe(0);
            expect(vm(wrapper).isLoading).toBe(true);
            expect(vm(wrapper).hasAnswerFeedback).toBe(false);
        });
    });
});
