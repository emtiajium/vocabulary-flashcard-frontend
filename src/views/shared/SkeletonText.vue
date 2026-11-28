<template>
    <ion-skeleton-text
        :animated="animated && !prefersReducedMotion"
        :style="{
            width,
            height,
            '--border-radius': borderRadius,
        }"
        aria-hidden="true"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonSkeletonText } from '@ionic/vue';

export default defineComponent({
    name: 'SkeletonText',
    components: {
        IonSkeletonText,
    },
    props: {
        width: {
            type: String,
            default: '100%',
        },
        height: {
            type: String,
            default: '1rem',
        },
        borderRadius: {
            type: String,
            default: 'var(--radius-xs)',
        },
        animated: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            prefersReducedMotion: false,
            motionPreference: null as MediaQueryList | null,
        };
    },
    mounted() {
        if (typeof window.matchMedia !== 'function') {
            return;
        }

        this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

        this.prefersReducedMotion = this.motionPreference.matches;

        this.motionPreference.addEventListener('change', this.onMotionPreferenceChange);
    },
    beforeUnmount() {
        this.motionPreference?.removeEventListener('change', this.onMotionPreferenceChange);
    },
    methods: {
        onMotionPreferenceChange(event: MediaQueryListEvent): void {
            this.prefersReducedMotion = event.matches;
        },
    },
});
</script>
