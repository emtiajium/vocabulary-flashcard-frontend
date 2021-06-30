<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>Vocabulary</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Hello!</ion-card-title>
                </ion-card-header>
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonToolbar, IonHeader, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/vue';

export default defineComponent({
    name: 'Vocabulary',
    components: {
        IonPage,
        IonToolbar,
        IonHeader,
        IonTitle,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
    },
});
</script>

<style scoped></style>
