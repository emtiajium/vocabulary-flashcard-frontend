/**
 * @jest-environment jsdom
 */
import Toast from '@/utils/Toast';
import { createAnimation, toastController } from '@ionic/vue';

jest.mock('@ionic/vue', () => ({
    __esModule: true,
    toastController: { create: jest.fn() },
    createAnimation: jest.fn(),
}));

interface ChromeableAnimation {
    addElement: jest.Mock;
    duration: jest.Mock;
    easing: jest.Mock;
    fromTo: jest.Mock;
}

const toastControllerMock = toastController as unknown as { create: jest.Mock };
const createAnimationMock = createAnimation as unknown as jest.Mock;

const animation = (): ChromeableAnimation => {
    const chain: ChromeableAnimation = {
        addElement: jest.fn(),
        duration: jest.fn(),
        easing: jest.fn(),
        fromTo: jest.fn(),
    };
    chain.addElement.mockReturnValue(chain);
    chain.duration.mockReturnValue(chain);
    chain.easing.mockReturnValue(chain);
    chain.fromTo.mockReturnValue(chain);

    return chain;
};

let chrome: ChromeableAnimation;

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

const options = (): Record<string, unknown> => toastControllerMock.create.mock.calls[0][0] as Record<string, unknown>;

const baseElement = (withWrapper: boolean): HTMLElement => {
    const wrapper = { tagName: 'DIV' };

    return {
        shadowRoot: { querySelector: (): unknown => (withWrapper ? wrapper : null) },
    } as unknown as HTMLElement;
};

describe('Toast', () => {
    beforeEach(() => {
        setReducedMotion(false);
        chrome = animation();
        createAnimationMock.mockReturnValue(chrome);
        toastControllerMock.create.mockResolvedValue({ present: jest.fn().mockResolvedValue(undefined) });
    });

    describe('WHEN a message is presented', () => {
        it('SHOULD default to a neutral info toast', async () => {
            await Toast.present('Back to Box 1!');

            expect(options().message).toBe('Back to Box 1!');
            expect(options().color).toBe('light');
            expect(options().cssClass).toEqual(['firecracker-toast', 'firecracker-toast--info']);
            expect(String(options().icon)).toContain('data:image/svg+xml');
        });

        it('SHOULD give a success its own colour and icon', async () => {
            await Toast.present('You just made a flashcard.', 'success');

            expect(options().color).toBe('success');
            expect(options().cssClass).toEqual(['firecracker-toast', 'firecracker-toast--success']);
        });

        it('SHOULD give a failure its own colour and icon', async () => {
            await Toast.present('Something went wrong', 'error');

            expect(options().color).toBe('danger');
            expect(options().cssClass).toEqual(['firecracker-toast', 'firecracker-toast--error']);
        });

        it('SHOULD let a failure be read for longer than a confirmation', async () => {
            await Toast.present('Something went wrong', 'error');
            const failureDuration = options().duration;
            toastControllerMock.create.mockClear();

            await Toast.present('Saved', 'success');

            expect(options().duration).toBeLessThan(failureDuration as number);
        });

        it('SHOULD carry the glyph inline so it works offline and follows the theme', async () => {
            await Toast.present('Saved', 'success');

            const icon = decodeURIComponent(String(options().icon));

            // A data URI rather than a URL, so nothing is fetched at runtime.
            expect(String(options().icon)).toMatch(/^data:image\/svg\+xml,/);
            expect(icon).toContain('<svg');
            expect(icon).toContain('fill="currentColor"');
        });
    });

    describe('WHEN the toast animates', () => {
        it('SHOULD slide the wrapper in and out', async () => {
            await Toast.present('Saved', 'success');

            const builder = options().enterAnimation as (element: HTMLElement) => unknown;
            builder(baseElement(true));

            expect(chrome.addElement).toHaveBeenCalled();
            expect(chrome.fromTo).toHaveBeenCalledWith('transform', expect.any(String), expect.any(String));
            expect(chrome.easing).toHaveBeenCalled();
        });

        it('SHOULD only fade WHEN the user asked for less motion', async () => {
            setReducedMotion(true);
            await Toast.present('Saved', 'success');

            const builder = options().enterAnimation as (element: HTMLElement) => unknown;
            builder(baseElement(true));

            expect(chrome.duration).toHaveBeenCalledWith(1);
            expect(chrome.fromTo).not.toHaveBeenCalledWith('transform', expect.any(String), expect.any(String));
        });
    });
});
