<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>Vocabularies</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button>
                    <ion-icon :icon="add" @click="$router.push('/add-vocabulary')"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonFab, IonFabButton } from '@ionic/vue';
import { add } from 'ionicons/icons';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'VocabularyList',
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonIcon,
        IonFab,
        IonFabButton,
    },
    data() {
        return { add };
    },
});
</script>

<style scoped></style>
