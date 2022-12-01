<template>
    <ion-page>
        <firecracker-header
            :header-title="$route.params.word"
            content-id="dictionary"
            menu-id="dictionary-menu"
            type="BACK"
        />
        <ion-content :fullscreen="true" id="dictionary">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <dictionary :word="$route.params.word" :label-alignment="'center'" />
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonRow, IonCol } from '@ionic/vue';
import Dictionary from '@/views/vocab-read/Dictionary.vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';

export default defineComponent({
    name: 'DictionaryPage',
    components: {
        Dictionary,
        FirecrackerHeader,
        IonPage,
        IonContent,
        IonRow,
        IonCol,
    },
});
</script>

<style scoped></style>
