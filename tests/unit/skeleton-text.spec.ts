/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import SkeletonText from '@/views/shared/SkeletonText.vue';

jest.mock('@ionic/vue', () => {
    const { defineComponent } = jest.requireActual('vue');
    return {
        IonSkeletonText: defineComponent({
            props: { animated: Boolean },
            template: '<div :data-animated="String(animated)" />',
        }),
    };
});

describe('Skeleton text accessibility', () => {
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        jest.useRealTimers();
    });

    const setReducedMotion = (matches: boolean): void => {
        window.matchMedia = jest.fn(() => ({
            matches,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        })) as unknown as typeof window.matchMedia;
    };

    it('SHOULD remain decorative and static WHEN reduced motion is enabled', async () => {
        setReducedMotion(true);
        const wrapper = mount(SkeletonText);
        await wrapper.vm.$nextTick();
        expect(wrapper.attributes('aria-hidden')).toBe('true');
        expect(wrapper.attributes('data-animated')).toBe('false');
        wrapper.unmount();
    });

    it('SHOULD stop animating after five seconds', async () => {
        setReducedMotion(false);
        const wrapper = mount(SkeletonText);
        await wrapper.vm.$nextTick();
        expect(wrapper.attributes('data-animated')).toBe('true');
        jest.advanceTimersByTime(5000);
        await wrapper.vm.$nextTick();
        expect(wrapper.attributes('data-animated')).toBe('false');
        wrapper.unmount();
    });

    it('SHOULD remain static WHEN the motion preference API is unavailable', async () => {
        Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
        const wrapper = mount(SkeletonText);
        await wrapper.vm.$nextTick();
        expect(wrapper.attributes('data-animated')).toBe('false');
        wrapper.unmount();
    });
});
