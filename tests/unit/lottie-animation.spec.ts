/**
 * @jest-environment jsdom
 */
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import LottieAnimation from '@/media/LottieAnimation.vue';
import funGame from '@/media/lottie/fun-game.json';
import retention from '@/media/lottie/retention.json';

jest.mock('lottie-web/build/player/lottie_light', () => {
    const animationItem = {
        totalFrames: 120,
        play: jest.fn(),
        pause: jest.fn(),
        destroy: jest.fn(),
        goToAndStop: jest.fn(),
        addEventListener: jest.fn(),
    };

    return {
        __esModule: true,
        default: { loadAnimation: jest.fn(() => animationItem) },
    };
});

interface MockAnimationItem {
    totalFrames: number;
    play: jest.Mock;
    pause: jest.Mock;
    destroy: jest.Mock;
    goToAndStop: jest.Mock;
    addEventListener: jest.Mock;
}

interface LottieModuleMock {
    default: { loadAnimation: jest.Mock };
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const lottie = (): LottieModuleMock => jest.requireMock('lottie-web/build/player/lottie_light') as LottieModuleMock;

const loadAnimation = (): jest.Mock => lottie().default.loadAnimation;

const animationItem = (): MockAnimationItem => loadAnimation().mock.results[0].value as MockAnimationItem;

const setReducedMotion = (matches: boolean): void => {
    window.matchMedia = jest.fn((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
};

const setColorVariables = (variables: Record<string, string>): void => {
    const implementation = (): CSSStyleDeclaration =>
        ({ getPropertyValue: (name: string): string => variables[name] ?? '' } as unknown as CSSStyleDeclaration);

    if (jest.isMockFunction(window.getComputedStyle)) {
        (window.getComputedStyle as jest.Mock).mockImplementation(implementation);
        return;
    }

    jest.spyOn(window, 'getComputedStyle').mockImplementation(implementation);
};

/** Fires one of the events the component subscribed to on the animation item. */
const emitAnimationEvent = (name: string): void => {
    const calls = animationItem().addEventListener.mock.calls as [string, () => void][];
    const registration = calls.find(([eventName]) => eventName === name);

    registration?.[1]();
};

const mountedWrappers: VueWrapper[] = [];

const mountAnimation = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}): VueWrapper => {
    const wrapper = mount(LottieAnimation, {
        props: { animationData: retention, ...props },
        slots,
    });
    mountedWrappers.push(wrapper);

    return wrapper;
};

const collectColors = (node: unknown, colors: number[][] = []): number[][] => {
    if (Array.isArray(node)) {
        node.forEach((child) => collectColors(child, colors));
        return colors;
    }

    if (typeof node !== 'object' || node === null) {
        return colors;
    }

    const candidate = node as { ty?: string; c?: { a: number; k: number[] } };

    if (
        candidate.c &&
        candidate.c.a === 0 &&
        Array.isArray(candidate.c.k) &&
        ['fl', 'st'].includes(candidate.ty ?? '')
    ) {
        colors.push(candidate.c.k);
    }

    Object.values(candidate).forEach((child) => collectColors(child, colors));

    return colors;
};

const loadedAnimationData = (): Record<string, unknown> =>
    (loadAnimation().mock.calls[0][0] as { animationData: Record<string, unknown> }).animationData;

describe('LottieAnimation', () => {
    beforeEach(() => {
        setReducedMotion(false);
        setColorVariables({});
    });

    afterEach(() => {
        // Unmounting also detaches the document-level listeners, which would
        // otherwise keep firing into the next test through the shared lottie mock.
        while (mountedWrappers.length) {
            try {
                mountedWrappers.pop()?.unmount();
            } catch {
                // the test already unmounted this wrapper
            }
        }

        jest.restoreAllMocks();
    });

    describe('WHEN motion is allowed', () => {
        it('SHOULD load the animation lazily and start playing it', async () => {
            const wrapper = mountAnimation();
            await flushPromises();

            expect(loadAnimation()).toHaveBeenCalledTimes(1);
            expect(animationItem().play).toHaveBeenCalledTimes(1);
            expect(wrapper.find('.lottie-animation__surface').exists()).toBe(true);
        });

        it('SHOULD hand the visible surface element to lottie as the container', async () => {
            const wrapper = mountAnimation();
            await flushPromises();

            const { container } = loadAnimation().mock.calls[0][0] as { container: HTMLElement };
            const surface = wrapper.find('.lottie-animation__surface').element;

            expect(container).toBe(surface);
        });
    });

    describe('WHEN the animation data cannot be rendered', () => {
        it('SHOULD render the static fallback slot', async () => {
            const wrapper = mountAnimation(
                {},
                { fallback: '<span class="fallback-marker">Static illustration</span>' },
            );
            await flushPromises();

            emitAnimationEvent('data_failed');
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.fallback-marker').exists()).toBe(true);
            expect(wrapper.find('.lottie-animation__surface').attributes('style')).toContain('display: none');
        });
    });

    describe('WHEN the user prefers reduced motion', () => {
        beforeEach(() => setReducedMotion(true));

        it('SHOULD skip downloading Lottie and render the static fallback slot', async () => {
            const wrapper = mountAnimation(
                {},
                { fallback: '<span class="fallback-marker">Static illustration</span>' },
            );
            await flushPromises();

            expect(loadAnimation()).not.toHaveBeenCalled();
            expect(wrapper.find('.fallback-marker').exists()).toBe(true);
        });

        it('SHOULD show a single static frame WHEN no fallback slot is provided', async () => {
            mountAnimation();
            await flushPromises();

            expect(loadAnimation()).toHaveBeenCalledTimes(1);
            expect(animationItem().addEventListener).toHaveBeenCalledWith('DOMLoaded', expect.any(Function));

            emitAnimationEvent('DOMLoaded');

            expect(animationItem().goToAndStop).toHaveBeenCalledWith(119, true);
            expect(animationItem().play).not.toHaveBeenCalled();
        });
    });

    describe('WHEN the animation document is swapped', () => {
        it('SHOULD replace the running instance instead of keeping the previous artwork', async () => {
            const wrapper = mountAnimation();
            await flushPromises();

            expect(loadAnimation()).toHaveBeenCalledTimes(1);

            await wrapper.setProps({ animationData: funGame });
            await flushPromises();

            expect(animationItem().destroy).toHaveBeenCalledTimes(1);
            expect(loadAnimation()).toHaveBeenCalledTimes(2);
        });
    });

    describe('WHEN a one-shot animation has already played', () => {
        it('SHOULD stay on its last frame instead of replaying', async () => {
            mountAnimation({ loop: false });
            await flushPromises();

            expect(animationItem().play).toHaveBeenCalledTimes(1);

            emitAnimationEvent('complete');
            document.dispatchEvent(new Event('visibilitychange'));
            await flushPromises();

            expect(animationItem().play).toHaveBeenCalledTimes(1);
            expect(animationItem().pause).toHaveBeenCalled();
        });

        it('SHOULD still play a looping animation again', async () => {
            mountAnimation();
            await flushPromises();

            emitAnimationEvent('complete');
            document.dispatchEvent(new Event('visibilitychange'));
            await flushPromises();

            expect(animationItem().play).toHaveBeenCalledTimes(2);
        });
    });

    describe('WHEN the component is unmounted', () => {
        it('SHOULD destroy the lottie instance', async () => {
            const wrapper = mountAnimation();
            await flushPromises();

            wrapper.unmount();

            expect(animationItem().destroy).toHaveBeenCalledTimes(1);
        });
    });

    describe('WHEN it exposes semantics to assistive technology', () => {
        it('SHOULD hide decorative animations', async () => {
            const wrapper = mountAnimation();
            await flushPromises();

            expect(wrapper.attributes('aria-hidden')).toBe('true');
            expect(wrapper.attributes('role')).toBeUndefined();
        });

        it('SHOULD expose a labelled image WHEN asked not to be decorative', async () => {
            const wrapper = mountAnimation({ decorative: false, ariaLabel: 'Spaced repetition intervals' });
            await flushPromises();

            expect(wrapper.attributes('role')).toBe('img');
            expect(wrapper.attributes('aria-label')).toBe('Spaced repetition intervals');
            expect(wrapper.attributes('aria-hidden')).toBeUndefined();
        });
    });

    describe('WHEN it derives its layout from the animation document', () => {
        it('SHOULD keep the composition aspect ratio', async () => {
            const wrapper = mountAnimation({ animationData: { w: 320, h: 240 } });
            await flushPromises();

            expect((wrapper.element as HTMLElement).style.aspectRatio).toBe('320 / 240');
        });
    });

    describe('WHEN the brand palette is themed', () => {
        it('SHOULD swap the placeholder colors for the resolved CSS variables', async () => {
            setColorVariables({
                '--ion-color-primary': '#0b0c0d',
                '--ion-color-primary-tint': 'rgb(1, 2, 3)',
                '--ion-color-primary-contrast': '#ffffff',
            });

            mountAnimation();
            await flushPromises();

            const colors = collectColors(loadedAnimationData());

            expect(colors).toContainEqual([11 / 255, 12 / 255, 13 / 255, 1]);
            expect(colors).toContainEqual([1 / 255, 2 / 255, 3 / 255, 1]);
        });

        it('SHOULD fall back to the authored placeholder colors WHEN nothing is themed', async () => {
            mountAnimation();
            await flushPromises();

            const colors = collectColors(loadedAnimationData());

            expect(colors).toContainEqual([24 / 255, 121 / 255, 78 / 255, 1]);
        });
    });
});
