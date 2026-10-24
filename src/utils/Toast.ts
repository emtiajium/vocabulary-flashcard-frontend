import { Animation, createAnimation, toastController } from '@ionic/vue';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircleCheck, faCircleInfo, faCircleXmark, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastVariantDefinition {
    /** Ionic colour token that gives the toast its surface and contrast text. */
    color: string;
    icon: IconDefinition;
}

const VARIANTS: Record<ToastVariant, ToastVariantDefinition> = {
    success: { color: 'success', icon: faCircleCheck },
    error: { color: 'danger', icon: faCircleXmark },
    warning: { color: 'warning', icon: faTriangleExclamation },
    info: { color: 'light', icon: faCircleInfo },
};

const DURATION_IN_MS = 2200;
/** Failures and cautions carry more to read than a plain confirmation. */
const LONG_DURATION_IN_MS = 3400;
const LONG_VARIANTS: ToastVariant[] = ['error', 'warning'];

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Ionic takes the toast icon as a URL, so the glyph travels as an SVG data URI.
 * `currentColor` makes it follow the toast's contrast colour in either theme.
 */
const iconToDataUri = (icon: IconDefinition): string => {
    const [width, height, , , pathData] = icon.icon;
    const path = Array.isArray(pathData) ? pathData.join(' ') : pathData;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor"><path d="${path}"/></svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

const wrapperOf = (baseElement: HTMLElement): HTMLElement | null =>
    (baseElement.shadowRoot ?? baseElement).querySelector('.toast-wrapper');

/**
 * Slides the toast in with a slight scale so it reads as a card arriving, and
 * mirrors that on the way out. Users who asked for less motion get a plain fade.
 */
const enterAnimation = (baseElement: HTMLElement): Animation => {
    const wrapper = wrapperOf(baseElement);

    if (!wrapper || prefersReducedMotion()) {
        return createAnimation().addElement(baseElement).duration(1).fromTo('opacity', '0', '1');
    }

    return createAnimation()
        .addElement(wrapper)
        .duration(260)
        .easing('cubic-bezier(0.3, 0, 0, 1)')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(24px) scale(0.96)', 'translateY(0) scale(1)');
};

const leaveAnimation = (baseElement: HTMLElement): Animation => {
    const wrapper = wrapperOf(baseElement);

    if (!wrapper || prefersReducedMotion()) {
        return createAnimation().addElement(baseElement).duration(1).fromTo('opacity', '1', '0');
    }

    return createAnimation()
        .addElement(wrapper)
        .duration(180)
        .easing('cubic-bezier(0.2, 0, 0, 1)')
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateY(0) scale(1)', 'translateY(14px) scale(0.98)');
};

export default class Toast {
    /**
     * `variant` drives the surface colour, the icon and how long the message stays:
     * an error is worth more reading time than a confirmation.
     */
    static async present(message: string, variant: ToastVariant = 'info'): Promise<void> {
        const { color, icon } = VARIANTS[variant];

        const toast = await toastController.create({
            message,
            color,
            icon: iconToDataUri(icon),
            duration: LONG_VARIANTS.includes(variant) ? LONG_DURATION_IN_MS : DURATION_IN_MS,
            cssClass: ['firecracker-toast', `firecracker-toast--${variant}`],
            enterAnimation,
            leaveAnimation,
        });

        await toast.present();
    }
}
