<template>
    <ion-page>
        <firecracker-header :header-title="$route.params.word" content-id="dictionary" menu-id="dictionary-menu" />
        <ion-content :fullscreen="true" id="dictionary">
            <ion-grid>
                <ion-row class="display-flex ion-justify-content-center">
                    <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="10" sizeXl="10">
                        <dictionary :word="$route.params.word" />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonGrid, IonRow, IonCol } from '@ionic/vue';
import Dictionary from '@/views/Dictionary.vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';

export default defineComponent({
    name: 'DictionaryPage',
    components: {
        Dictionary,
        FirecrackerHeader,
        IonPage,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
    },
});
</script>

<style scoped></style>
