/**
 * @jest-environment jsdom
 */
import { Component, defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import AddDefinition from '@/views/vocab-upsert/AddDefinition.vue';
import Definition from '@/domains/Definition';
import DefinitionValidator from '@/utils/DefinitionValidator';
import Toast from '@/utils/Toast';
import { apiDefinitionPayload, buildDefinitionInstance } from '../fixtures/payloads';

/**
 * `@vue/vue3-jest` compiles the script with `target: es5`, so the imports become
 * module-scoped `var`s that the compiled template can overwrite. `AddDefinition.vue`
 * therefore imports from `vue` before `@ionic/vue`, otherwise the mock below would be
 * replaced by the real `vue` module and `useBackButton` would be undefined.
 */
jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });
    return {
        IonContent: IonStub,
        IonTextarea: IonStub,
        IonItem: IonStub,
        IonPage: IonStub,
        IonButton: IonStub,
        IonCard: IonStub,
        IonRow: IonStub,
        IonCol: IonStub,
        IonCardTitle: IonStub,
        IonCardSubtitle: IonStub,
        IonCardHeader: IonStub,
        IonCardContent: IonStub,
        IonicVue: { install: jest.fn() },
        useBackButton: jest.fn(),
    };
});

/**
 * The child views and the presentational components have their own tests; here we only
 * care about how the definition view collects their data, validates the payload and
 * hands it back to the vocabulary view.
 */
jest.mock('@/views/shared/FirecrackerHeader.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    return { __esModule: true, default: define({ template: '<div><slot /></div>' }) };
});

jest.mock('@/views/vocab-upsert/AddDefinitionExamples.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/vocab-upsert/AddDefinitionNotes.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/views/vocab-upsert/AddDefinitionExternalLinks.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    return { __esModule: true, default: define({ template: '<div />' }) };
});

jest.mock('@/utils/Toast', () => ({
    __esModule: true,
    default: { present: jest.fn() },
}));

jest.mock('@/utils/Alert', () => ({
    __esModule: true,
    default: { presentAlertConfirm: jest.fn() },
}));

interface MockedToast {
    present: jest.Mock;
}

interface AddDefinitionProps {
    word: string;
    vocabularyId: string;
    definition?: Definition;
    onComingBackToVocab(definition: Definition): void;
    onCancellingAddingDefinition(definition: Definition): void;
}

interface AddDefinitionVm {
    persist(): Promise<void>;
    setMeaning(meaning: string): void;
    meaning: string;
}

const toast = Toast as unknown as MockedToast;

// Stand-ins for the data the child views own.
let examplesFromChildView: string[] = [];
let notesFromChildView: string[] = [];
let externalLinksFromChildView: string[] = [];

const methodStub = (name: string, methods: Record<string, () => unknown>): ReturnType<typeof defineComponent> =>
    defineComponent({ name, template: '<div />', methods });

const asPlainJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const vm = (wrapper: VueWrapper): AddDefinitionVm => wrapper.vm as unknown as AddDefinitionVm;

const mountView = (props: Partial<AddDefinitionProps> = {}): VueWrapper =>
    shallowMount(AddDefinition as unknown as Component<AddDefinitionProps>, {
        props: {
            word: 'Poggers',
            vocabularyId: apiDefinitionPayload.vocabularyId,
            onComingBackToVocab: jest.fn(),
            onCancellingAddingDefinition: jest.fn(),
            ...props,
        },
        global: {
            renderStubDefaultSlot: true,
            stubs: {
                AddDefinitionExamples: methodStub('AddDefinitionExamples', {
                    getExamples: () => examplesFromChildView,
                    clear: () => [],
                }),
                AddDefinitionNotes: methodStub('AddDefinitionNotes', {
                    getNotes: () => notesFromChildView,
                    clear: () => [],
                }),
                AddDefinitionExternalLinks: methodStub('AddDefinitionExternalLinks', {
                    getExternalLinks: () => externalLinksFromChildView,
                    clear: () => [],
                }),
            },
        },
    });

describe('Definition validator (integration)', () => {
    it('SHOULD accept a definition built by the view', () => {
        expect(() => DefinitionValidator.validate(buildDefinitionInstance())).not.toThrow();
    });

    it('SHOULD accept a definition coming from the API as a plain object', () => {
        expect(() => DefinitionValidator.validate(asPlainJson(apiDefinitionPayload))).not.toThrow();
    });

    it('SHOULD reject a blank meaning', () => {
        expect(() => DefinitionValidator.validate(buildDefinitionInstance({ meaning: '' }))).toThrow(
            /Please add a meaning/,
        );
    });

    it('SHOULD reject a definition without examples', () => {
        expect(() => DefinitionValidator.validate(buildDefinitionInstance({ examples: [] }))).toThrow(
            /Add at least one example/,
        );
    });

    it('SHOULD reject an empty example', () => {
        expect(() => DefinitionValidator.validate(buildDefinitionInstance({ examples: [''] }))).toThrow(
            /Examples can't be empty/,
        );
    });

    it('SHOULD reject an empty note', () => {
        expect(() => DefinitionValidator.validate(buildDefinitionInstance({ notes: [''] }))).toThrow(
            /Notes can't be empty/,
        );
    });

    it('SHOULD reject an invalid external link', () => {
        expect(() => DefinitionValidator.validate(buildDefinitionInstance({ externalLinks: ['not-a-url'] }))).toThrow(
            /doesn't look like a valid URL/,
        );
    });

    it('SHOULD throw an Error carrying a user-facing message WHEN the definition is invalid', () => {
        let thrown: Error | undefined;
        try {
            DefinitionValidator.validate(buildDefinitionInstance({ meaning: '' }));
        } catch (error) {
            thrown = error as Error;
        }

        expect(thrown).toBeInstanceOf(Error);
        expect(thrown?.message).toMatch(/Please add a meaning/);
    });
});

describe('Definition upsert view (integration)', () => {
    beforeEach(() => {
        examplesFromChildView = [];
        notesFromChildView = [];
        externalLinksFromChildView = [];
    });

    describe('WHEN the definition is valid', () => {
        it('SHOULD hand the definition back to the vocabulary view', async () => {
            const onComingBackToVocab = jest.fn();
            examplesFromChildView = ['Project 550 was successful. Poggers!'];
            const wrapper = mountView({ onComingBackToVocab });
            vm(wrapper).setMeaning('  (Pop-culture) To express excitement when something exciting occurs.  ');

            await vm(wrapper).persist();

            expect(toast.present).not.toHaveBeenCalled();
            expect(onComingBackToVocab).toHaveBeenCalledTimes(1);
            expect(onComingBackToVocab).toHaveBeenCalledWith(
                expect.objectContaining({
                    vocabularyId: apiDefinitionPayload.vocabularyId,
                    meaning: '(Pop-culture) To express excitement when something exciting occurs.',
                    examples: ['Project 550 was successful. Poggers!'],
                    notes: [],
                    externalLinks: [],
                }),
            );
        });

        it('SHOULD clear the form after a successful save', async () => {
            examplesFromChildView = ['Project 550 was successful. Poggers!'];
            const wrapper = mountView();
            vm(wrapper).setMeaning('(Pop-culture) To express excitement when something exciting occurs.');

            await vm(wrapper).persist();

            expect(vm(wrapper).meaning).toBe('');
        });

        it('SHOULD keep the id of the definition that is being edited', async () => {
            const existing = buildDefinitionInstance();
            const onComingBackToVocab = jest.fn();
            examplesFromChildView = existing.examples as string[];
            const wrapper = mountView({ definition: existing, onComingBackToVocab });

            await vm(wrapper).persist();

            expect(onComingBackToVocab).toHaveBeenCalledWith(expect.objectContaining({ id: existing.id }));
        });
    });

    describe('WHEN the definition is invalid', () => {
        it('SHOULD show the message and SHOULD NOT hand anything back WHEN the meaning is blank', async () => {
            const onComingBackToVocab = jest.fn();
            examplesFromChildView = ['Project 550 was successful. Poggers!'];
            const wrapper = mountView({ onComingBackToVocab });
            vm(wrapper).setMeaning('   ');

            await vm(wrapper).persist();

            expect(onComingBackToVocab).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith(expect.stringMatching(/Please add a meaning/));
        });

        it('SHOULD show the message and SHOULD NOT hand anything back WHEN there is no example', async () => {
            const onComingBackToVocab = jest.fn();
            const wrapper = mountView({ onComingBackToVocab });
            vm(wrapper).setMeaning('(Pop-culture) To express excitement when something exciting occurs.');

            await vm(wrapper).persist();

            expect(onComingBackToVocab).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith(expect.stringMatching(/Add at least one example/));
        });

        it('SHOULD show the message WHEN an external link provided by a child view is invalid', async () => {
            const onComingBackToVocab = jest.fn();
            examplesFromChildView = ['Project 550 was successful. Poggers!'];
            externalLinksFromChildView = ['not-a-url'];
            const wrapper = mountView({ onComingBackToVocab });
            vm(wrapper).setMeaning('(Pop-culture) To express excitement when something exciting occurs.');

            await vm(wrapper).persist();

            expect(onComingBackToVocab).not.toHaveBeenCalled();
            expect(toast.present).toHaveBeenCalledWith(expect.stringMatching(/doesn't look like a valid URL/));
        });
    });
});
