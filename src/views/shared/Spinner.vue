<template>
    <view class="container ion-justify-content-center ion-padding-top ion-padding-bottom" :style="inlineStyle">
        <span class="firecracker-spinner" role="status" aria-label="Loading">
            <svg class="firecracker-spinner__art" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <circle class="firecracker-spinner__track" cx="24" cy="24" r="21" />
                <circle class="firecracker-spinner__arc" cx="24" cy="24" r="21" />
            </svg>
        </span>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Spinner',
    props: {
        inlineStyle: {
            type: String,
            required: false,
            default(): string {
                return '';
            },
        },
    },
});
</script>

<style scoped>
.container {
    height: 100%;
    display: flex;
}

.firecracker-spinner {
    display: block;
    width: var(--default-spinner-dimension);
    height: var(--default-spinner-dimension);
}

.firecracker-spinner__art {
    display: block;
    width: 100%;
    height: 100%;
    /* Spun as a single piece, so the loop point is invisible. Linear on purpose:
       an eased rotation reads as stuttering. */
    animation: firecracker-spin 900ms linear infinite;
}

.firecracker-spinner__track,
.firecracker-spinner__arc {
    fill: none;
    stroke-width: 4;
    stroke-linecap: round;
}

.firecracker-spinner__track {
    stroke: var(--ion-color-lightest);
}

.firecracker-spinner__arc {
    /* A quarter of the circumference (2 x pi x 21 = 132) marks the moving end. */
    stroke: var(--ion-color-primary);
    stroke-dasharray: 33 99;
}

@keyframes firecracker-spin {
    to {
        transform: rotate(360deg);
    }
}

/* Same policy as LottieAnimation: with motion reduced the indicator holds still
   rather than freezing mid-rotation. */
@media (prefers-reduced-motion: reduce) {
    .firecracker-spinner__art {
        animation: none;
    }
}
</style>
