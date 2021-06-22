<template>
    <ion-card>
        <ion-card-header>
            <ion-grid>
                <ion-row>
                    <ion-col size="8">
                        <ion-card-title class="ion-text-capitalize">{{ vocabulary.word }}</ion-card-title>
                    </ion-col>
                    <ion-col size="4">
                        <ion-buttons class="ion-justify-content-end">
                            <ion-button color="light">
                                <ion-icon :icon="trashOutline" color="danger"></ion-icon>
                            </ion-button>
                            <ion-button color="light">
                                <ion-icon :icon="pencilOutline" color="warning"></ion-icon>
                            </ion-button>
                        </ion-buttons>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card-header>

        <ion-card-content>
            Keep close to Nature's heart... and break clear away, once in awhile, and climb a mountain or spend a week
            in the woods. Wash your spirit clean.
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonButtons,
} from '@ionic/vue';
import { trashOutline, pencilOutline } from 'ionicons/icons';
import { defineComponent } from 'vue';
import { Components } from '@ionic/core/components';

type IonInfiniteScrollType = Components.IonInfiniteScroll;

export default defineComponent({
    name: 'Vocabulary',
    components: {
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon,
        IonButton,
        IonButtons,
    },
    props: ['vocabulary'],
    data() {
        return { trashOutline, pencilOutline };
    },
});
</script>

<style scoped></style>
