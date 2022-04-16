<template>
    <!-- all credit goes to https://iconpark.oceanengine.com/official -->
    <svg width="25" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" fill="white" fill-opacity="0.01" />
        <path d="M28 12V4L8 14V42L20 36" :stroke="`var(${colorVariable})`" stroke-width="4" stroke-linejoin="bevel" />
        <path
            d="M20 16L40 6V34L20 44V16Z"
            :fill="`var(${colorVariable})`"
            :stroke="`var(${colorVariable})`"
            stroke-width="4"
            stroke-linejoin="bevel"
        />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FlashcardIcon',
    props: ['colorVariable'],
});
</script>
<style scoped></style>
