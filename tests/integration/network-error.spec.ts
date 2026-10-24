/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import NetworkError from '@/views/shared/NetworkError.vue';
import MessageDB from '@/utils/MessageDB';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return { IonCardSubtitle: IonStub };
});

interface NetworkErrorVm {
    noConnectionAnimation: Record<string, unknown>;
}

const vm = (wrapper: VueWrapper): NetworkErrorVm => wrapper.vm as unknown as NetworkErrorVm;

const mountView = (props: Record<string, unknown> = {}): VueWrapper =>
    mount(NetworkError, {
        props,
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

describe('Network error (shared)', () => {
    describe('WHEN the connection is lost', () => {
        it('SHOULD animate the wifi signal instead of showing the icon alone', () => {
            const wrapper = mountView();

            expect(wrapper.find('.lottie-stub').exists()).toBe(true);
            expect((vm(wrapper).noConnectionAnimation as { nm: string }).nm).toBe('no-connection');
        });

        it('SHOULD keep the wifi-off icon as the static fallback', () => {
            const wrapper = mountView();

            const fallback = wrapper.find('.lottie-stub svg');

            expect(fallback.exists()).toBe(true);
            // The icon has to stay scalable, otherwise the fallback cannot fill the box.
            expect(fallback.attributes('viewBox')).toBe('0 0 48 48');
        });
    });

    describe('WHEN a message is given', () => {
        it('SHOULD show it instead of the default one', () => {
            const wrapper = mountView({ message: 'We could not reach the server.' });

            expect(wrapper.text()).toContain('We could not reach the server.');
        });

        it('SHOULD fall back to the shared network message', () => {
            const wrapper = mountView();

            expect(wrapper.text()).toContain(MessageDB.networkError);
        });
    });
});
