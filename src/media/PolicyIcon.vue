<template>
    <!-- all credit goes to https://fonts.google.com/icons -->
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 50 50">
        <path
            :fill="`var(${fillColorVariable})`"
            :stroke="`var(${strokeColorVariable})`"
            d="M24 28.3q1.85 0 3.15-1.275 1.3-1.275 1.3-3.125 0-1.9-1.3-3.2-1.3-1.3-3.15-1.3-1.85 0-3.15 1.3-1.3 1.3-1.3 3.2 0 1.85 1.3 3.125T24 28.3ZM24 44q-7-1.75-11.5-8.125T8 21.9V10l16-6 16 6v11.9q0 3.25-.9 6.375T36.6 34.1l-6.4-6.2q.65-.85.95-1.9.3-1.05.3-2.1 0-3.15-2.175-5.325Q27.1 16.4 24 16.4q-3.1 0-5.275 2.175Q16.55 20.75 16.55 23.9q0 3.1 2.175 5.25T24 31.3q1.1 0 2.15-.35 1.05-.35 2-.9l6.75 6.55q-2.1 2.7-4.85 4.625Q27.3 43.15 24 44Z"
        />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Policy',
    props: ['fillColorVariable', 'strokeColorVariable'],
});
</script>

<style scoped></style>
