<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title class="ion-text-capitalize">{{ word }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-item lines="none">
                <ion-label>Meaning</ion-label>
            </ion-item>
            <ion-item>
                <ion-input type="text"></ion-input>
            </ion-item>

            <add-definition-example />

            <add-definition-notes />

            <add-definition-external-links />

            <ion-button expand="block" @click="$router.back()">Save</ion-button>
        </ion-content>
    </ion-page>
</template>

<script>
import {
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import AddDefinitionExample from '@/views/AddDefinitionExample.vue';
import AddDefinitionNotes from '@/views/AddDefinitionNotes.vue';
import AddDefinitionExternalLinks from '@/views/AddDefinitionExternalLinks.vue';
import { useRoute } from 'vue-router';

export default defineComponent({
    name: 'AddDefinition',
    components: {
        AddDefinitionExternalLinks,
        AddDefinitionNotes,
        AddDefinitionExample,
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
    },
    data() {
        const { vocabularyId, word } = useRoute().params;
        return {
            vocabularyId,
            word,
        };
    },
});
</script>

<style scoped></style>
