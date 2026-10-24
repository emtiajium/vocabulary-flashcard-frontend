/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import VocabularyDetails from '@/views/vocab-read/VocabularyDetails.vue';
import LeitnerSystemService from '@/utils/LeitnerSystemService';

import Vocabulary from '@/domains/Vocabulary';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonCard: IonStub,
        IonCardContent: IonStub,
        IonCardHeader: IonStub,
        IonCardTitle: IonStub,
        IonFab: IonStub,
        IonFabButton: IonStub,
        IonChip: IonStub,
        IonRow: IonStub,
        IonCol: IonStub,
    };
});

jest.mock('@fortawesome/vue-fontawesome', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, FontAwesomeIcon: define({ template: '<i />' }) };
});

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
    __esModule: true,
    faExternalLinkAlt: {},
    faPencilAlt: {},
    faHeart: {},
}));

jest.mock('@fortawesome/free-regular-svg-icons', () => ({ __esModule: true, faHeart: {} }));

jest.mock('@/media/LottieAnimation.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ name: 'LottieAnimation', template: '<div class="lottie-stub" />' }) };
});

jest.mock('@/views/shared/Spinner.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/vocab-read/EmptyContainer.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/vocab-read/Dictionary.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/utils/LeitnerSystemService', () => ({
    __esModule: true,
    default: { insertIntoLeitnerBox: jest.fn() },
}));

interface MinifiedVocabularyVm {
    isInLeitnerBox: boolean;
    disableBoxInsertionButton: boolean;
    flashcardFeedback: { top: number; left: number } | null;
    flashcardFeedbackKey: number;
    insertIntoLeitnerBox(clickEvent: MouseEvent): Promise<void>;
    onFlashcardFeedbackComplete(): void;
    clean(): void;
}

const leitnerSystemService = LeitnerSystemService as unknown as { insertIntoLeitnerBox: jest.Mock };

const vm = (wrapper: VueWrapper): MinifiedVocabularyVm => wrapper.vm as unknown as MinifiedVocabularyVm;

/** A 40x40 FAB whose centre sits at (350, 800) in the viewport. */
const heartFab = (): HTMLElement =>
    ({
        getBoundingClientRect: (): DOMRect =>
            ({
                top: 780,
                left: 330,
                width: 40,
                height: 40,
                right: 370,
                bottom: 820,
                x: 330,
                y: 780,
                toJSON: (): Record<string, never> => ({}),
            } as DOMRect),
    } as unknown as HTMLElement);

const clickEvent = (target: HTMLElement): MouseEvent => ({ currentTarget: target } as unknown as MouseEvent);

const buildVocabulary = (): Vocabulary => {
    const vocabulary = new Vocabulary();
    vocabulary.id = 'vocabulary-1';
    vocabulary.word = 'Debris';
    vocabulary.isDraft = false;
    vocabulary.definitions = [];

    return vocabulary;
};

const mountView = (): VueWrapper =>
    shallowMount(VocabularyDetails, {
        props: {
            word: 'Debris',
            vocabulary: buildVocabulary(),
            disableInsertingIntoLeitnerBox: false,
            isLoading: false,
        },
    });

describe('Vocabulary details (integration)', () => {
    beforeEach(() => {
        leitnerSystemService.insertIntoLeitnerBox.mockResolvedValue(true);
    });

    describe('WHEN the heart FAB is tapped and the flashcard is created', () => {
        it('SHOULD burst out of the FAB and fill the heart', async () => {
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartFab()));

            expect(vm(wrapper).flashcardFeedback).toEqual({ top: 800, left: 350 });
            expect(vm(wrapper).flashcardFeedbackKey).toBe(1);
            expect(vm(wrapper).isInLeitnerBox).toBe(true);
        });

        it('SHOULD drop the overlay once the burst has finished', async () => {
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartFab()));
            vm(wrapper).onFlashcardFeedbackComplete();

            expect(vm(wrapper).flashcardFeedback).toBeNull();
        });

        it('SHOULD clear the overlay WHEN the view is cleaned up', async () => {
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartFab()));
            vm(wrapper).clean();

            expect(vm(wrapper).flashcardFeedback).toBeNull();
        });
    });

    describe('WHEN the flashcard could not be created', () => {
        it('SHOULD not celebrate and SHOULD leave the heart outline', async () => {
            leitnerSystemService.insertIntoLeitnerBox.mockResolvedValue(false);
            const wrapper = mountView();

            await vm(wrapper).insertIntoLeitnerBox(clickEvent(heartFab()));

            expect(vm(wrapper).flashcardFeedback).toBeNull();
            expect(vm(wrapper).isInLeitnerBox).toBe(false);
            expect(vm(wrapper).disableBoxInsertionButton).toBe(false);
        });
    });
});
