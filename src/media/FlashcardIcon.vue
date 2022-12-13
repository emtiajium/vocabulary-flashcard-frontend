<template>
    <!-- all credit goes to https://iconpark.oceanengine.com/official -->
    <svg width="25" height="25" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" :fill="`var(${fillColorVariable})`" fill-opacity="0.01" />
        <path
            d="M28 12V4L8 14V42L20 36"
            :stroke="`var(${strokeColorVariable})`"
            stroke-width="4"
            stroke-linejoin="bevel"
        />
        <path
            d="M20 16L40 6V34L20 44V16Z"
            :fill="`var(${fillColorVariable})`"
            :stroke="`var(${strokeColorVariable})`"
            stroke-width="4"
            stroke-linejoin="bevel"
        />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FlashcardIcon',
    props: ['fillColorVariable', 'strokeColorVariable'],
});
</script>
<style scoped></style>
