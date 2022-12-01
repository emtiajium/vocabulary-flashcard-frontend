<template>
    <vocabulary-list />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VocabularyList from '@/views/vocab-read/VocabularyList.vue';

export default defineComponent({
    name: 'AuthenticatedHome',
    components: {
        VocabularyList,
    },
});
</script>

<style scoped></style>
