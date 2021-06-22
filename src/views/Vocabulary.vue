<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title class="ion-text-capitalize">{{ vocabulary.word }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            Keep close to Nature's heart... and break clear away, once in awhile, and climb a mountain or spend a week
            in the woods. Wash your spirit clean.
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue';
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
    },
    props: ['vocabulary'],
});
</script>

<style scoped></style>
