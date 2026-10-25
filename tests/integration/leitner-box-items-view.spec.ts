/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import LeitnerBoxItems from '@/views/leitner-systems/LeitnerBoxItems.vue';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import NativeStorage from '@/utils/NativeStorage';
import LeitnerBoxItem from '@/domains/LeitnerBoxItem';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonButton: IonStub,
        IonCard: IonStub,
        IonCardContent: IonStub,
        IonCardHeader: IonStub,
        IonCardSubtitle: IonStub,
        IonCardTitle: IonStub,
        IonCol: IonStub,
        IonContent: IonStub,
        IonInfiniteScroll: IonStub,
        IonPage: IonStub,
        IonRow: IonStub,
    };
});

jest.mock('@fortawesome/vue-fontawesome', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, FontAwesomeIcon: define({ template: '<i />' }) };
});

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
    __esModule: true,
    faCalendarAlt: {},
    faClock: {},
    faGlassCheers: {},
    faUnlockAlt: {},
    faArrowLeft: {},
    faArrowRight: {},
}));

jest.mock('@fortawesome/free-regular-svg-icons', () => ({ __esModule: true, faHeart: {} }));

jest.mock('@/views/shared/FirecrackerHeader.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div><slot /></div>' }) };
});

jest.mock('@/views/shared/Spinner.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/shared/EndOfList.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ name: 'EndOfList', template: '<div class="end-of-list-stub" />' }) };
});

jest.mock('@/views/shared/NetworkError.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/media/LottieAnimation.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ name: 'LottieAnimation', template: '<div class="lottie-stub" />' }) };
});

// The real handler pulls in the Google sign-in client, which needs DOM types the
// test tsconfig does not load.
jest.mock('@/utils/HttpHandler', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('@/utils/Toast', () => ({ __esModule: true, default: { present: jest.fn() } }));

jest.mock('@/utils/NativeStorage', () => ({
    __esModule: true,
    default: {
        getShouldReloadLeitnerItems: jest.fn(),
        removeShouldReloadLeitnerItems: jest.fn(),
        getUpdatedVocabulary: jest.fn(),
    },
}));

interface LeitnerBoxItemsVm {
    box: string;
    totalItems: number;
    boxItems: LeitnerBoxItem[];
    allQuietOnTheWesternFront: boolean;
    isDisabled: boolean;
    isNetworkError: boolean;
    singleLeitnerItemEarlierToBoxAppearanceDate: { vocabulary?: unknown };
    shouldShowEndOfList: boolean;
    hasMasteredFeedback: boolean;
    isMasteredFeedbackPlaying: boolean;
    masteredFeedbackKey: number;
    emptyStateAnimation: Record<string, unknown>;
    shouldShowEmptyState: boolean;
    moveForward(vocabularyId: string): Promise<void>;
    moveBackward(vocabularyId: string): Promise<void>;
    onMasteredFeedbackComplete(): void;
    clean(): void;
}

const http = HttpHandler as unknown as { get: jest.Mock; post: jest.Mock; put: jest.Mock };
const toast = Toast as unknown as { present: jest.Mock };
const nativeStorage = NativeStorage as unknown as {
    getShouldReloadLeitnerItems: jest.Mock;
    removeShouldReloadLeitnerItems: jest.Mock;
    getUpdatedVocabulary: jest.Mock;
};

const vm = (wrapper: VueWrapper): LeitnerBoxItemsVm => wrapper.vm as unknown as LeitnerBoxItemsVm;

const emptyStateName = (wrapper: VueWrapper): string => (vm(wrapper).emptyStateAnimation as { nm: string }).nm;

const mountView = (box: string, count = '0'): VueWrapper =>
    shallowMount(LeitnerBoxItems, {
        global: {
            mocks: {
                $route: { params: { box, count } },
            },
            stubs: { RouterLink: true },
        },
    });

describe('Leitner box items view (integration)', () => {
    beforeEach(() => {
        http.post.mockResolvedValue({ results: [], total: 0 });
        http.put.mockResolvedValue(undefined);
        toast.present.mockResolvedValue(undefined);
        nativeStorage.getShouldReloadLeitnerItems.mockResolvedValue(false);
        nativeStorage.removeShouldReloadLeitnerItems.mockResolvedValue(undefined);
        nativeStorage.getUpdatedVocabulary.mockResolvedValue({});
    });

    describe('WHEN the box is empty', () => {
        it('SHOULD invite a first flashcard WHEN Box 1 has no vocabularies yet', () => {
            const wrapper = mountView('1', '0');

            expect(emptyStateName(wrapper)).toBe('empty-flashcards');
        });

        it('SHOULD explain the wait WHEN the box is a later one', () => {
            const wrapper = mountView('3', '2');

            expect(emptyStateName(wrapper)).toBe('waiting-for-review');
        });

        it('SHOULD explain the wait WHEN Box 1 still holds vocabularies', () => {
            const wrapper = mountView('1', '4');

            expect(emptyStateName(wrapper)).toBe('waiting-for-review');
        });
    });

    describe('WHEN a box has been browsed to the end', () => {
        const boxItems = (): LeitnerBoxItem[] => [
            { vocabularyId: 'vocabulary-1', word: 'Carrion', updatedAt: new Date() },
        ];

        it('SHOULD mark the bottom of the list', () => {
            const wrapper = mountView('2', '1');
            vm(wrapper).boxItems = boxItems();
            vm(wrapper).isDisabled = true;

            expect(vm(wrapper).shouldShowEndOfList).toBe(true);
        });

        it('SHOULD stay quiet while more pages are left to fetch', () => {
            const wrapper = mountView('2', '40');
            vm(wrapper).boxItems = boxItems();
            vm(wrapper).isDisabled = false;

            expect(vm(wrapper).shouldShowEndOfList).toBe(false);
        });

        it('SHOULD stay quiet WHEN later items are still due', () => {
            const wrapper = mountView('2', '1');
            vm(wrapper).boxItems = boxItems();
            vm(wrapper).isDisabled = true;
            vm(wrapper).singleLeitnerItemEarlierToBoxAppearanceDate = { vocabulary: { word: 'Carrion' } };

            expect(vm(wrapper).shouldShowEndOfList).toBe(false);
        });

        it('SHOULD stay quiet WHEN the box holds nothing', () => {
            const wrapper = mountView('2', '0');
            vm(wrapper).boxItems = [];
            vm(wrapper).isDisabled = true;

            expect(vm(wrapper).shouldShowEndOfList).toBe(false);
        });

        it('SHOULD stay quiet WHEN the request failed', () => {
            const wrapper = mountView('2', '1');
            vm(wrapper).boxItems = boxItems();
            vm(wrapper).isDisabled = true;
            vm(wrapper).isNetworkError = true;

            expect(vm(wrapper).shouldShowEndOfList).toBe(false);
        });
    });

    describe('WHEN a vocabulary is moved forward', () => {
        it('SHOULD celebrate mastering the word after leaving Box 4', async () => {
            const wrapper = mountView('4', '1');

            await vm(wrapper).moveForward('vocabulary-1');

            expect(http.put).toHaveBeenCalledWith('/v1/leitner-systems/forward/vocabulary-1');
            expect(vm(wrapper).hasMasteredFeedback).toBe(true);
            expect(vm(wrapper).masteredFeedbackKey).toBe(1);
        });

        it('SHOULD not celebrate while there are still boxes ahead', async () => {
            const wrapper = mountView('2', '1');

            await vm(wrapper).moveForward('vocabulary-1');

            expect(vm(wrapper).hasMasteredFeedback).toBe(false);
            expect(vm(wrapper).masteredFeedbackKey).toBe(0);
        });

        it('SHOULD replay the celebration for each mastered word', async () => {
            const wrapper = mountView('4', '2');

            await vm(wrapper).moveForward('vocabulary-1');
            await vm(wrapper).moveForward('vocabulary-2');

            expect(vm(wrapper).masteredFeedbackKey).toBe(2);
        });
    });

    describe('WHEN the box is emptied by a move', () => {
        it('SHOULD hold the empty state back until the mastery celebration has finished', async () => {
            const wrapper = mountView('4', '1');

            await vm(wrapper).moveForward('vocabulary-1');
            await wrapper.vm.$nextTick();

            // The box is empty now, but the clock must not share the stage with
            // the celebration.
            expect(vm(wrapper).allQuietOnTheWesternFront).toBe(true);
            expect(vm(wrapper).isMasteredFeedbackPlaying).toBe(true);
            expect(vm(wrapper).shouldShowEmptyState).toBe(false);

            vm(wrapper).onMasteredFeedbackComplete();
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).isMasteredFeedbackPlaying).toBe(false);
            expect(vm(wrapper).shouldShowEmptyState).toBe(true);
        });

        it('SHOULD show the empty state right away WHEN the move is not a mastery', async () => {
            const wrapper = mountView('2', '1');

            await vm(wrapper).moveForward('vocabulary-1');
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).allQuietOnTheWesternFront).toBe(true);
            expect(vm(wrapper).shouldShowEmptyState).toBe(true);
        });
    });

    describe('WHEN a vocabulary is moved backward', () => {
        it('SHOULD not celebrate', async () => {
            const wrapper = mountView('4', '1');

            await vm(wrapper).moveBackward('vocabulary-1');

            expect(http.put).toHaveBeenCalledWith('/v1/leitner-systems/backward/vocabulary-1');
            expect(vm(wrapper).hasMasteredFeedback).toBe(false);
        });
    });

    describe('WHEN the view is cleaned up', () => {
        it('SHOULD drop the mastery feedback', async () => {
            const wrapper = mountView('4', '1');

            await vm(wrapper).moveForward('vocabulary-1');
            vm(wrapper).clean();

            expect(vm(wrapper).hasMasteredFeedback).toBe(false);
            expect(vm(wrapper).masteredFeedbackKey).toBe(0);
        });
    });
});
