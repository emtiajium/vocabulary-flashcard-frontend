<template>
    <div ref="root" class="lottie-animation" :style="aspectRatioStyle" v-bind="accessibilityAttributes">
        <div v-show="!shouldRenderFallback" ref="surface" class="lottie-animation__surface"></div>
        <div v-if="shouldRenderFallback" class="lottie-animation__fallback">
            <slot name="fallback" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { AnimationItem, LottiePlayer } from 'lottie-web';

/** Shape of the bodymovin/Lottie JSON handled by this component. */
interface LottieAnimationData {
    w: number;
    h: number;
    [key: string]: unknown;
}

type Rgb = [number, number, number];
type PaletteKey = 'primary' | 'accent' | 'contrast';
type Palette = Record<PaletteKey, Rgb>;

/**
 * The animation assets are authored with these exact colors as placeholders.
 * At runtime they are swapped for the values of the CSS variables below, which
 * keeps a single asset working across the light and dark themes (and any future
 * brand palette) instead of shipping one JSON file per theme.
 *
 * See `src/media/lottie/README.md` for the authoring contract.
 */
const PLACEHOLDER_PALETTE: Palette = {
    primary: [24, 121, 78],
    accent: [60, 142, 106],
    contrast: [250, 250, 250],
};

const COLOR_TOLERANCE = 2;
const COLOR_SHAPE_TYPES = ['fl', 'st'];
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_COLOR_PATTERN = /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/i;

/**
 * `lottie-web` is ~168 kB minified, and it is only needed on the screens that
 * actually animate. It is loaded on demand so it never lands in the initial
 * bundle, and the promise is cached so the four intro slides share one download.
 */
let lottieLoader: Promise<{ default: LottiePlayer }> | null = null;

const loadLottie = (): Promise<{ default: LottiePlayer }> => {
    if (!lottieLoader) {
        lottieLoader = import(/* webpackChunkName: "lottie-player" */ 'lottie-web/build/player/lottie_light');
    }

    return lottieLoader;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isColorArray = (value: unknown): value is number[] =>
    Array.isArray(value) && value.length >= 3 && value.every((channel) => typeof channel === 'number');

const toBytes = (channels: number[]): Rgb => [
    Math.round(channels[0] * 255),
    Math.round(channels[1] * 255),
    Math.round(channels[2] * 255),
];

const matchPlaceholder = (bytes: Rgb): PaletteKey | null => {
    const keys: PaletteKey[] = ['primary', 'accent', 'contrast'];

    return (
        keys.find((key) =>
            PLACEHOLDER_PALETTE[key].every((channel, index) => Math.abs(channel - bytes[index]) <= COLOR_TOLERANCE),
        ) ?? null
    );
};

const themeShapeColor = (shape: Record<string, unknown>, palette: Palette): void => {
    const color = shape.c;

    if (!isRecord(color) || color.a !== 0 || !isColorArray(color.k)) {
        return;
    }

    const key = matchPlaceholder(toBytes(color.k));

    if (!key) {
        return;
    }

    const [red, green, blue] = palette[key];
    const alpha = color.k[3] ?? 1;
    color.k = [red / 255, green / 255, blue / 255, alpha];
};

/** Recursively swaps the placeholder colors of every fill/stroke in the tree. */
const applyPalette = (node: unknown, palette: Palette): void => {
    if (Array.isArray(node)) {
        node.forEach((child) => applyPalette(child, palette));
        return;
    }

    if (!isRecord(node)) {
        return;
    }

    if (typeof node.ty === 'string' && COLOR_SHAPE_TYPES.includes(node.ty)) {
        themeShapeColor(node, palette);
    }

    Object.values(node).forEach((child) => applyPalette(child, palette));
};

const parseColor = (value: string): Rgb | null => {
    const normalized = value.trim();

    if (!normalized) {
        return null;
    }

    const hex = normalized.match(HEX_COLOR_PATTERN);

    if (hex) {
        const digits =
            hex[1].length === 3
                ? hex[1]
                      .split('')
                      .map((digit) => digit + digit)
                      .join('')
                : hex[1];
        const red = parseInt(digits.slice(0, 2), 16);
        const green = parseInt(digits.slice(2, 4), 16);
        const blue = parseInt(digits.slice(4, 6), 16);

        return [red, green, blue];
    }

    const rgb = normalized.match(RGB_COLOR_PATTERN);

    if (rgb) {
        return [Math.round(Number(rgb[1])), Math.round(Number(rgb[2])), Math.round(Number(rgb[3]))];
    }

    return null;
};

const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

export default defineComponent({
    name: 'LottieAnimation',
    props: {
        /** A Lottie/bodymovin JSON document, imported from `src/media/lottie`. */
        animationData: {
            type: Object as PropType<LottieAnimationData>,
            required: true,
        },
        primaryColorVariable: {
            type: String,
            default: '--ion-color-primary',
        },
        accentColorVariable: {
            type: String,
            default: '--ion-color-primary-tint',
        },
        contrastColorVariable: {
            type: String,
            default: '--ion-color-primary-contrast',
        },
        loop: {
            type: Boolean,
            default: true,
        },
        autoplay: {
            type: Boolean,
            default: true,
        },
        /** Decorative animations are hidden from assistive technologies. */
        decorative: {
            type: Boolean,
            default: true,
        },
        ariaLabel: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            animation: null as AnimationItem | null,
            hasFailed: false,
            isVisible: true,
            isUnmounted: false,
            isReducedMotion: prefersReducedMotion(),
            paletteSignature: '',
            observer: null as IntersectionObserver | null,
            themeObserver: null as MutationObserver | null,
            motionQuery: null as MediaQueryList | null,
        };
    },
    computed: {
        /**
         * When motion is reduced we prefer the static illustration (the `fallback`
         * slot) over a frozen animation frame: a paused frame of a looping
         * animation is rarely a complete composition.
         */
        shouldRenderFallback(): boolean {
            return this.hasFailed || (this.isReducedMotion && Boolean(this.$slots.fallback));
        },
        aspectRatioStyle(): Record<string, string> {
            const width = Number(this.animationData.w) || 1;
            const height = Number(this.animationData.h) || 1;

            return { aspectRatio: `${width} / ${height}` };
        },
        accessibilityAttributes(): Record<string, string> {
            return this.decorative ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': this.ariaLabel };
        },
    },
    mounted() {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        this.watchMotionPreference();
        this.watchTheme();
        this.observeVisibility();
        this.createAnimation().catch(() => {
            this.hasFailed = true;
        });
    },
    beforeUnmount() {
        this.isUnmounted = true;
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        this.observer?.disconnect();
        this.observer = null;
        this.themeObserver?.disconnect();
        this.themeObserver = null;

        if (this.motionQuery && typeof this.motionQuery.removeEventListener === 'function') {
            this.motionQuery.removeEventListener('change', this.handleMotionPreferenceChange);
        }

        this.destroyAnimation();
    },
    methods: {
        async createAnimation(): Promise<void> {
            const surface = this.$refs.surface as HTMLElement | undefined;

            if (!surface || this.animation || this.isUnmounted || this.shouldRenderFallback) {
                return;
            }

            const { default: lottie } = await loadLottie();

            if (this.isUnmounted || this.animation || this.shouldRenderFallback) {
                return;
            }

            const data = JSON.parse(JSON.stringify(this.animationData)) as LottieAnimationData;
            const palette = this.resolvePalette();
            applyPalette(data, palette);
            this.paletteSignature = JSON.stringify(palette);

            const item = lottie.loadAnimation({
                container: surface,
                renderer: 'svg',
                loop: !this.isReducedMotion && this.loop,
                autoplay: false,
                animationData: data,
                rendererSettings: {
                    progressiveLoad: true,
                    preserveAspectRatio: 'xMidYMid meet',
                },
            });

            item.addEventListener('data_failed', () => {
                this.hasFailed = true;
            });

            item.addEventListener('DOMLoaded', () => {
                if (this.isReducedMotion) {
                    item.goToAndStop(Math.max(item.totalFrames - 1, 0), true);
                }
            });

            this.animation = item;
            this.syncPlayback();
        },

        destroyAnimation(): void {
            this.animation?.destroy();
            this.animation = null;
        },

        /**
         * Only the visible, foreground slide animates. Off-screen slides (Swiper
         * keeps them in the DOM) and a backgrounded tab are paused, which keeps
         * the onboarding screen cheap on low-end Android devices.
         */
        syncPlayback(): void {
            if (!this.animation) {
                return;
            }

            const shouldPlay = this.autoplay && !this.isReducedMotion && this.isVisible && !document.hidden;

            if (shouldPlay) {
                this.animation.play();
            } else {
                this.animation.pause();
            }
        },

        observeVisibility(): void {
            if (typeof IntersectionObserver === 'undefined') {
                return;
            }

            const root = this.$refs.root as HTMLElement | undefined;

            if (!root) {
                return;
            }

            this.observer = new IntersectionObserver(
                (entries) => {
                    const [entry] = entries;
                    this.isVisible = Boolean(entry?.isIntersecting);
                    this.syncPlayback();
                },
                { threshold: 0 },
            );
            this.observer.observe(root);
        },

        watchMotionPreference(): void {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                return;
            }

            this.motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
            this.isReducedMotion = this.motionQuery.matches;

            if (typeof this.motionQuery.addEventListener === 'function') {
                this.motionQuery.addEventListener('change', this.handleMotionPreferenceChange);
            }
        },

        watchTheme(): void {
            if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
                return;
            }

            this.themeObserver = new MutationObserver(() => {
                this.handleThemeChange();
            });

            const attributes = { attributes: true, attributeFilter: ['class'] };
            this.themeObserver.observe(document.documentElement, attributes);
            this.themeObserver.observe(document.body, attributes);
        },

        resolvePalette(): Palette {
            return {
                primary: this.readColorVariable(this.primaryColorVariable, PLACEHOLDER_PALETTE.primary),
                accent: this.readColorVariable(this.accentColorVariable, PLACEHOLDER_PALETTE.accent),
                contrast: this.readColorVariable(this.contrastColorVariable, PLACEHOLDER_PALETTE.contrast),
            };
        },

        readColorVariable(variable: string, fallback: Rgb): Rgb {
            if (typeof document === 'undefined') {
                return fallback;
            }

            return parseColor(getComputedStyle(document.body).getPropertyValue(variable)) ?? fallback;
        },

        handleVisibilityChange(): void {
            this.syncPlayback();
        },

        handleMotionPreferenceChange(event: MediaQueryListEvent): void {
            this.isReducedMotion = event.matches;

            if (this.shouldRenderFallback) {
                this.destroyAnimation();
            } else {
                this.createAnimation().catch(() => {
                    this.hasFailed = true;
                });
            }
        },

        handleThemeChange(): void {
            if (!this.animation) {
                return;
            }

            const signature = JSON.stringify(this.resolvePalette());

            if (signature === this.paletteSignature) {
                return;
            }

            this.destroyAnimation();
            this.createAnimation().catch(() => {
                this.hasFailed = true;
            });
        },
    },
});
</script>

<style scoped>
.lottie-animation {
    position: relative;
    display: block;
}

.lottie-animation__surface,
.lottie-animation__fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lottie-animation__surface :deep(svg),
.lottie-animation__fallback :deep(svg) {
    width: 100%;
    height: 100%;
}
</style>
