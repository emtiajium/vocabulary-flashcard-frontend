<template>
    <ion-page>
        <firecracker-header :header-title="$route.params.word" content-id="dictionary" menu-id="dictionary-menu" />
        <ion-content :fullscreen="true" id="dictionary">
            <dictionary :word="$route.params.word" />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import Dictionary from '@/views/Dictionary.vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';

export default defineComponent({
    name: 'DictionaryPage',
    components: {
        Dictionary,
        FirecrackerHeader,
        IonPage,
        IonContent,
    },
});
</script>

<style scoped></style>
