<template>
    <vocabulary-list />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VocabularyList from '@/views/VocabularyList.vue';
import { useBackButton, useIonRouter } from '@ionic/vue';
import { App } from '@capacitor/app';

export default defineComponent({
    name: 'AuthenticatedHome',
    components: {
        VocabularyList,
    },
    setup() {
        const ionRouter = useIonRouter();
        useBackButton(-1, () => {
            if (!ionRouter.canGoBack()) {
                App.exitApp();
            }
        });
    },
});
</script>

<style scoped></style>
