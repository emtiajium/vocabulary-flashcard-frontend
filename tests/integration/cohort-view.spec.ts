/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import CohortView from '@/views/cohort/Cohort.vue';
import HttpHandler from '@/utils/HttpHandler';
import User from '@/domains/User';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonCard: IonStub,
        IonCardContent: IonStub,
        IonCardHeader: IonStub,
        IonCardSubtitle: IonStub,
        IonCardTitle: IonStub,
        IonCol: IonStub,
        IonContent: IonStub,
        IonPage: IonStub,
        IonRow: IonStub,
    };
});

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

// The real handler pulls in the Google sign-in client, which needs DOM types the
// test tsconfig does not load.
jest.mock('@/utils/HttpHandler', () => ({ __esModule: true, default: { get: jest.fn() } }));

interface CohortViewVm {
    cohortWaitingAnimation: Record<string, unknown>;
    init(): Promise<void>;
    isTheUserAlone(): boolean;
}

const http = HttpHandler as unknown as { get: jest.Mock };

const vm = (wrapper: VueWrapper): CohortViewVm => wrapper.vm as unknown as CohortViewVm;

const member = (name: string): User => ({ name, username: `${name.toLowerCase()}@example.com`, profilePictureUrl: '' });

const mountView = async (users: User[]): Promise<VueWrapper> => {
    http.get.mockResolvedValue({ name: 'Fantastic Four!', users });

    const wrapper = shallowMount(CohortView, {
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
    await vm(wrapper).init();
    await wrapper.vm.$nextTick();

    return wrapper;
};

describe('Cohort view (integration)', () => {
    describe('WHEN the user is the only member', () => {
        it('SHOULD animate the empty state instead of showing the static illustration alone', async () => {
            const wrapper = await mountView([member('Joao')]);

            expect(vm(wrapper).isTheUserAlone()).toBe(true);
            expect(wrapper.find('.lottie-stub').exists()).toBe(true);
            expect((vm(wrapper).cohortWaitingAnimation as { nm: string }).nm).toBe('cohort-waiting');
        });

        it('SHOULD keep the illustration as the static fallback', async () => {
            const wrapper = await mountView([member('Joao')]);

            const fallback = wrapper.find('.lottie-stub img');

            expect(fallback.exists()).toBe(true);
            expect(fallback.attributes('src')).toBe('/assets/icon/diversity.svg');
            expect(fallback.attributes('alt')).toBe('Cohort');
        });
    });

    describe('WHEN the cohort has other members', () => {
        it('SHOULD list the members and not animate the empty state', async () => {
            const wrapper = await mountView([member('Joao'), member('Kateryna')]);

            expect(vm(wrapper).isTheUserAlone()).toBe(false);
            expect(wrapper.find('.lottie-stub').exists()).toBe(false);
            expect(wrapper.text()).toContain('Joao');
            expect(wrapper.text()).toContain('Kateryna');
        });
    });

    describe('WHEN the cohort could not be loaded', () => {
        it('SHOULD flag the network error so the empty state is not claimed', async () => {
            http.get.mockRejectedValue(new Error('offline'));

            const wrapper = shallowMount(CohortView, {
                global: {
                    renderStubDefaultSlot: true,
                    stubs: {
                        LottieAnimation: defineComponent({
                            name: 'LottieAnimation',
                            template: '<div class="lottie-stub"><slot name="fallback" /></div>',
                        }),
                    },
                },
            });
            await vm(wrapper).init();
            await wrapper.vm.$nextTick();

            expect((wrapper.vm as unknown as { isNetworkError: boolean }).isNetworkError).toBe(true);
            expect(wrapper.find('.lottie-stub').exists()).toBe(false);
        });
    });
});
