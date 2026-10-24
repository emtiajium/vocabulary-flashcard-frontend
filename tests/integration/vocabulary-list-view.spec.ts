/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import VocabularyList from '@/views/vocab-read/VocabularyList.vue';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonButton: IonStub,
        IonCard: IonStub,
        IonCardContent: IonStub,
        IonCardSubtitle: IonStub,
        IonChip: IonStub,
        IonCol: IonStub,
        IonContent: IonStub,
        IonFab: IonStub,
        IonFabButton: IonStub,
        IonInfiniteScroll: IonStub,
        IonItem: IonStub,
        IonPage: IonStub,
        IonRefresher: IonStub,
        IonRow: IonStub,
    };
});

jest.mock('@fortawesome/vue-fontawesome', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, FontAwesomeIcon: define({ template: '<i />' }) };
});

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
    __esModule: true,
    faPlus: {},
    faGlassCheers: {},
    faThumbsUp: {},
}));

jest.mock('@/views/shared/FirecrackerHeader.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div><slot /></div>' }) };
});

jest.mock('@/views/shared/Spinner.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/shared/NetworkError.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/vocab-read/Settings.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

// Also keeps the Google sign-in client out of the module graph.
jest.mock('@/views/vocab-read/MinifiedVocabulary.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/utils/HttpHandler', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

jest.mock('@/utils/NativeStorage', () => ({
    __esModule: true,
    default: {
        getVocabSettings: jest.fn(),
        getLeitnerBoxExistence: jest.fn(),
        getUpdatedVocabulary: jest.fn(),
        removeLeitnerBoxExistence: jest.fn(),
        removeUpdatedVocabulary: jest.fn(),
        setVocabSettings: jest.fn(),
    },
}));

interface VocabularyListVm {
    allQuietOnTheWesternFront: boolean;
    isNetworkError: boolean;
    fetchFlashcard: boolean;
    vocabularies: unknown[];
    searchKeyword: string;
    isDisabled: boolean;
    emptyVocabulariesAnimation: Record<string, unknown>;
    emptySearchAnimation: Record<string, unknown>;
    shouldDisplayFetchButton(): boolean;
    shouldDisplayNoSearchResultMessage(): boolean;
}

const vm = (wrapper: VueWrapper): VocabularyListVm => wrapper.vm as unknown as VocabularyListVm;

const mountView = (): VueWrapper =>
    shallowMount(VocabularyList, {
        global: {
            renderStubDefaultSlot: true,
            stubs: {
                // Renders the static fallback so the reduced-motion path is assertable.
                LottieAnimation: defineComponent({
                    name: 'LottieAnimation',
                    template: '<div class="lottie-stub"><slot name="fallback" /></div>',
                }),
            },
        },
    });

describe('Vocabulary list view (integration)', () => {
    describe('WHEN the cohort has no vocabulary yet', () => {
        it('SHOULD animate the announcement instead of showing the icon alone', async () => {
            const wrapper = mountView();
            vm(wrapper).allQuietOnTheWesternFront = true;
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).shouldDisplayFetchButton()).toBe(true);
            expect(wrapper.find('.lottie-stub').exists()).toBe(true);
            expect((vm(wrapper).emptyVocabulariesAnimation as { nm: string }).nm).toBe('empty-vocabularies');
        });

        it('SHOULD keep the campaign icon as the static fallback', async () => {
            const wrapper = mountView();
            vm(wrapper).allQuietOnTheWesternFront = true;
            await wrapper.vm.$nextTick();

            const fallback = wrapper.find('.lottie-stub .material-icons');

            expect(fallback.exists()).toBe(true);
            expect(fallback.text()).toContain('campaign');
        });
    });

    describe('WHEN the search matched nothing', () => {
        it('SHOULD animate the search instead of showing the icon alone', async () => {
            const wrapper = mountView();
            vm(wrapper).isDisabled = true;
            vm(wrapper).searchKeyword = 'qwerty';
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).shouldDisplayNoSearchResultMessage()).toBe(true);
            expect(wrapper.find('.lottie-stub').exists()).toBe(true);
            expect((vm(wrapper).emptySearchAnimation as { nm: string }).nm).toBe('empty-search');
        });

        it('SHOULD keep the search icon as the static fallback', async () => {
            const wrapper = mountView();
            vm(wrapper).isDisabled = true;
            vm(wrapper).searchKeyword = 'qwerty';
            await wrapper.vm.$nextTick();

            const fallback = wrapper.find('.lottie-stub .material-icons');

            expect(fallback.exists()).toBe(true);
            expect(fallback.text()).toContain('manage_search');
        });

        it('SHOULD offer the keyword that found nothing', async () => {
            const wrapper = mountView();
            vm(wrapper).isDisabled = true;
            vm(wrapper).searchKeyword = 'qwerty';
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain('No vocabulary was found for "qwerty"');
        });

        it('SHOULD not animate a search that is still too short to run', async () => {
            const wrapper = mountView();
            vm(wrapper).isDisabled = true;
            vm(wrapper).searchKeyword = 'qw';
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).shouldDisplayNoSearchResultMessage()).toBe(false);
            expect(wrapper.find('.lottie-stub').exists()).toBe(false);
        });
    });

    describe('WHEN the cohort already has vocabulary', () => {
        it('SHOULD not show the announcement at all', async () => {
            const wrapper = mountView();
            vm(wrapper).vocabularies = [{ id: 'vocabulary-1', word: 'Debris' }];
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).shouldDisplayFetchButton()).toBe(false);
            expect(wrapper.find('.lottie-stub').exists()).toBe(false);
            expect(wrapper.text()).not.toContain('you do not have any vocabulary');
        });
    });
});
