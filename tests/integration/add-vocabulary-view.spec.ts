/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import AddVocabulary from '@/views/vocab-upsert/AddVocabulary.vue';
import Definition from '@/domains/Definition';
import Vocabulary from '@/domains/Vocabulary';
import HttpHandler from '@/utils/HttpHandler';
import NativeStorage from '@/utils/NativeStorage';
import Toast from '@/utils/Toast';
import { apiDefinitionPayload, apiVocabularyPayload, buildDefinitionInstance } from '../fixtures/payloads';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });
    return {
        IonContent: IonStub,
        IonTextarea: IonStub,
        IonItem: IonStub,
        IonPage: IonStub,
        IonToggle: IonStub,
        IonButton: IonStub,
        IonCard: IonStub,
        IonRow: IonStub,
        IonCol: IonStub,
        IonCardTitle: IonStub,
        IonCardSubtitle: IonStub,
        IonCardHeader: IonStub,
        IonCardContent: IonStub,
        IonSpinner: IonStub,
        IonicVue: { install: jest.fn() },
        useBackButton: jest.fn(),
    };
});

/**
 * The child views and the presentational components have their own tests; here we only
 * care about how the upsert view collects their data, validates the payload and calls
 * the API. Stubbing them also keeps their Ionic/native imports out of the test run.
 */
jest.mock('@/views/shared/FirecrackerHeader.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    return { __esModule: true, default: define({ template: '<div><slot /></div>' }) };
});

jest.mock('@/views/shared/Spinner.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/vocab-upsert/AddDefinition.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/utils/HttpHandler', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

jest.mock('@/utils/Toast', () => ({
    __esModule: true,
    default: { present: jest.fn() },
}));

jest.mock('@/utils/Alert', () => ({
    __esModule: true,
    default: { presentAlertConfirm: jest.fn() },
}));

jest.mock('@/utils/NativeStorage', () => ({
    __esModule: true,
    default: {
        setShouldReloadVocabularies: jest.fn(),
        setUpdatedVocabulary: jest.fn(),
        setLeitnerBoxExistence: jest.fn(),
    },
}));

interface MockedHttpHandler {
    get: jest.Mock;
    post: jest.Mock;
}

interface MockedToast {
    present: jest.Mock;
}

interface MockedNativeStorage {
    setShouldReloadVocabularies: jest.Mock;
    setUpdatedVocabulary: jest.Mock;
    setLeitnerBoxExistence: jest.Mock;
}

interface AddVocabularyVm {
    init(): Promise<void>;
    persist(): Promise<void>;
    setWord(word: string): void;
    setIsDraft(isDraft: boolean): void;
    onComingBackToVocab(definition: Definition): void;
    disableSaveButton: boolean;
}

const http = HttpHandler as unknown as MockedHttpHandler;
const toast = Toast as unknown as MockedToast;
const nativeStorage = NativeStorage as unknown as MockedNativeStorage;

// Stand-ins for the data the child views own.
let linkerWordsFromChildView: string[] = [];
let genericNotesFromChildView: string[] = [];
let genericExternalLinksFromChildView: string[] = [];

const methodStub = (name: string, methods: Record<string, () => unknown>): ReturnType<typeof defineComponent> =>
    defineComponent({ name, template: '<div />', methods });

const asPlainJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const vm = (wrapper: VueWrapper): AddVocabularyVm => wrapper.vm as unknown as AddVocabularyVm;

const mountView = (
    routeParams: Record<string, string> = {},
    router = { back: jest.fn(), replace: jest.fn() },
): VueWrapper =>
    shallowMount(AddVocabulary, {
        global: {
            renderStubDefaultSlot: true,
            mocks: {
                $route: { params: routeParams },
                $router: router,
            },
            stubs: {
                AddLinkerWords: methodStub('AddLinkerWords', {
                    getLinkerWords: () => linkerWordsFromChildView,
                    clear: () => [],
                }),
                AddGenericNotes: methodStub('AddGenericNotes', {
                    getGenericNotes: () => genericNotesFromChildView,
                    clear: () => [],
                }),
                AddGenericExternalLinks: methodStub('AddGenericExternalLinks', {
                    getGenericExternalLinks: () => genericExternalLinksFromChildView,
                    clear: () => [],
                }),
            },
        },
    });

/**
 * The view renders its body (and therefore mounts the child views) only after
 * `isLoading` becomes false, so the refs are available one tick after `init()`.
 */
const init = async (wrapper: VueWrapper): Promise<void> => {
    await vm(wrapper).init();
    await wrapper.vm.$nextTick();
};

const postedPayload = (): Vocabulary => http.post.mock.calls[0][1] as Vocabulary;

describe('Vocabulary upsert view (integration)', () => {
    beforeEach(() => {
        linkerWordsFromChildView = [];
        genericNotesFromChildView = [];
        genericExternalLinksFromChildView = [];
        http.get.mockResolvedValue(undefined);
        http.post.mockResolvedValue({});
    });

    describe('WHEN an existing vocabulary is edited', () => {
        it('SHOULD persist a vocabulary whose definitions came from the API as plain objects', async () => {
            const fromApi = asPlainJson(apiVocabularyPayload);
            http.get.mockResolvedValue(fromApi);
            http.post.mockResolvedValue({ ...fromApi, isInLeitnerBox: false });
            const wrapper = mountView({ id: fromApi.id });
            await init(wrapper);

            await vm(wrapper).persist();

            expect(toast.present).not.toHaveBeenCalled();
            expect(http.post).toHaveBeenCalledTimes(1);
            expect(http.post.mock.calls[0][0]).toBe('/v1/vocabularies');
            expect(postedPayload().id).toBe(fromApi.id);
            expect(postedPayload().word).toBe('Poggers');
            expect(postedPayload().definitions?.[0].meaning).toContain('Pop-culture');
            expect(postedPayload().isDraft).toBe(false);
        });

        it('SHOULD pick up the linker words, notes and links owned by the child views', async () => {
            const fromApi = asPlainJson(apiVocabularyPayload);
            linkerWordsFromChildView = ['Epiphany'];
            genericNotesFromChildView = ['heard it in a podcast'];
            genericExternalLinksFromChildView = ['https://example.com/epiphany'];
            http.get.mockResolvedValue(fromApi);
            http.post.mockResolvedValue(fromApi);
            const wrapper = mountView({ id: fromApi.id });
            await init(wrapper);

            await vm(wrapper).persist();

            expect(toast.present).not.toHaveBeenCalled();
            expect(postedPayload().linkerWords).toEqual(['Epiphany']);
            expect(postedPayload().genericNotes).toEqual(['heard it in a podcast']);
            expect(postedPayload().genericExternalLinks).toEqual(['https://example.com/epiphany']);
        });

        it('SHOULD not call the API and SHOULD show the message WHEN an edited definition has no meaning', async () => {
            const definition = asPlainJson(apiDefinitionPayload);
            definition.meaning = '';
            http.get.mockResolvedValue({ ...asPlainJson(apiVocabularyPayload), definitions: [definition] });
            const wrapper = mountView({ id: apiVocabularyPayload.id });
            await init(wrapper);

            await vm(wrapper).persist();

            expect(http.post).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith(expect.stringMatching(/Please add a meaning/));
        });

        it('SHOULD not call the API and SHOULD show the message WHEN an edited definition has no example', async () => {
            const definition = asPlainJson(apiDefinitionPayload);
            definition.examples = [];
            http.get.mockResolvedValue({ ...asPlainJson(apiVocabularyPayload), definitions: [definition] });
            const wrapper = mountView({ id: apiVocabularyPayload.id });
            await init(wrapper);

            await vm(wrapper).persist();

            expect(http.post).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith(expect.stringMatching(/Add at least one example/));
        });
    });

    describe('WHEN a new vocabulary is created', () => {
        it('SHOULD persist the word, its definitions and the child view data', async () => {
            linkerWordsFromChildView = ['Epiphany'];
            genericNotesFromChildView = ['heard it in a podcast'];
            genericExternalLinksFromChildView = ['https://example.com/epiphany'];
            const router = { back: jest.fn(), replace: jest.fn() };
            const wrapper = mountView({}, router);
            http.post.mockResolvedValue(apiVocabularyPayload);
            await init(wrapper);

            vm(wrapper).setWord('Poggers');
            vm(wrapper).onComingBackToVocab(buildDefinitionInstance());
            await vm(wrapper).persist();

            expect(toast.present).not.toHaveBeenCalled();
            expect(http.post).toHaveBeenCalledTimes(1);
            expect(postedPayload().word).toBe('Poggers');
            expect(postedPayload().isDraft).toBe(false);
            expect(postedPayload().definitions).toHaveLength(1);
            expect(postedPayload().definitions?.[0].meaning).toContain('Pop-culture');
            expect(postedPayload().linkerWords).toEqual(['Epiphany']);
            expect(postedPayload().genericNotes).toEqual(['heard it in a podcast']);
            expect(postedPayload().genericExternalLinks).toEqual(['https://example.com/epiphany']);
            expect(nativeStorage.setShouldReloadVocabularies).toHaveBeenCalledWith(true);
            expect(router.back).toHaveBeenCalled();
        });

        it('SHOULD persist a draft without any definition', async () => {
            const wrapper = mountView();
            http.post.mockResolvedValue(apiVocabularyPayload);
            await init(wrapper);

            vm(wrapper).setWord('Poggers');
            vm(wrapper).setIsDraft(true);
            await vm(wrapper).persist();

            expect(toast.present).not.toHaveBeenCalled();
            expect(http.post).toHaveBeenCalledTimes(1);
            expect(postedPayload().isDraft).toBe(true);
            expect(postedPayload().definitions).toEqual([]);
        });

        it('SHOULD not call the API WHEN a final vocabulary has no definition', async () => {
            const wrapper = mountView();
            await init(wrapper);

            vm(wrapper).setWord('Poggers');
            await vm(wrapper).persist();

            expect(http.post).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith(expect.stringMatching(/at least one definition/));
        });

        it('SHOULD not call the API WHEN the word is blank', async () => {
            const wrapper = mountView();
            await init(wrapper);

            vm(wrapper).setWord('   ');
            vm(wrapper).onComingBackToVocab(buildDefinitionInstance());
            await vm(wrapper).persist();

            expect(http.post).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith("Please enter a word. This field can't be left blank.");
        });

        it('SHOULD not call the API WHEN a child view provides an empty linker word', async () => {
            linkerWordsFromChildView = [''];
            const wrapper = mountView();
            await init(wrapper);

            vm(wrapper).setWord('Poggers');
            vm(wrapper).onComingBackToVocab(buildDefinitionInstance());
            await vm(wrapper).persist();

            expect(http.post).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith(expect.stringMatching(/Linker words can't be empty/));
        });
    });

    describe('WHEN the API rejects the vocabulary', () => {
        it('SHOULD show the server message and re-enable the save button', async () => {
            const wrapper = mountView();
            http.post.mockRejectedValue(new Error('Something went wrong on the server.'));
            await init(wrapper);

            vm(wrapper).setWord('Poggers');
            vm(wrapper).onComingBackToVocab(buildDefinitionInstance());
            await vm(wrapper).persist();

            expect(toast.present).toHaveBeenCalledWith('Something went wrong on the server.');
            expect(vm(wrapper).disableSaveButton).toBe(false);
        });
    });
});
