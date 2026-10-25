/**
 * @jest-environment jsdom
 */
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import LottieAnimation from '@/media/LottieAnimation.vue';
import retention from '@/media/lottie/retention.json';

/**
 * The player chunk failing to download is the case that used to strand a
 * consumer: the dynamic import rejects, so `createAnimation` never reaches the
 * point where it subscribes to the animation's own events, and nothing reports
 * completion. The Leitner box page reveals its empty state on that event.
 */
jest.mock('lottie-web/build/player/lottie_light', () => {
    throw new Error('Failed to fetch dynamically imported module');
});

interface LottieAnimationVm {
    hasFailed: boolean;
    hasReportedCompletion: boolean;
    handleFailure(): void;
}

const mountedWrappers: VueWrapper[] = [];

const vm = (wrapper: VueWrapper): LottieAnimationVm => wrapper.vm as unknown as LottieAnimationVm;

const mountAnimation = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}): VueWrapper => {
    const wrapper = mount(LottieAnimation, {
        props: { animationData: retention, ...props },
        slots,
    });
    mountedWrappers.push(wrapper);

    return wrapper;
};

describe('LottieAnimation WHEN the player cannot be downloaded', () => {
    beforeEach(() => {
        window.matchMedia = jest.fn(() => ({
            matches: false,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        })) as unknown as typeof window.matchMedia;
    });

    afterEach(() => {
        while (mountedWrappers.length) {
            mountedWrappers.pop()?.unmount();
        }
    });

    it('SHOULD fall back to the static illustration', async () => {
        const wrapper = mountAnimation({}, { fallback: '<span class="fallback-marker">Static</span>' });

        await flushPromises();

        expect(vm(wrapper).hasFailed).toBe(true);
        expect(wrapper.find('.fallback-marker').exists()).toBe(true);
    });

    it('SHOULD report completion so a one-shot cannot strand its caller', async () => {
        const wrapper = mountAnimation({ loop: false });

        await flushPromises();

        expect(wrapper.emitted('complete')).toHaveLength(1);
    });

    it('SHOULD not report completion for a looping animation', async () => {
        const wrapper = mountAnimation();

        await flushPromises();

        expect(wrapper.emitted('complete')).toBeUndefined();
    });

    it('SHOULD report completion only once, however often the failure is handled', async () => {
        const wrapper = mountAnimation({ loop: false });
        await flushPromises();

        vm(wrapper).handleFailure();
        vm(wrapper).handleFailure();

        expect(vm(wrapper).hasReportedCompletion).toBe(true);
        expect(wrapper.emitted('complete')).toHaveLength(1);
    });
});
