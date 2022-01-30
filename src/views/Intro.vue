<template>
    <ion-grid>
        <ion-row class="display-flex ion-justify-content-center">
            <ion-col sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="3" sizeXl="2">
                <ion-card class="ion-padding">
                    Ever wonder why you still remember the meaning of the words you learned in your childhood but
                    struggle for a vocab learned a few days or weeks back?
                </ion-card>
            </ion-col>
            <ion-col sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="3" sizeXl="2">
                <ion-card class="ion-padding">
                    According to science, spaced repetition is one of the techniques to retain anything in the long
                    term. The Leitner system works based on this principle. It suggests creating a
                    <strong>flashcard</strong> for each item and reviewing those at an interval.
                </ion-card>
            </ion-col>
            <ion-col sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="3" sizeXl="2">
                <ion-card class="ion-padding">
                    Join us to embed newly introduced words in your long-term memory.
                </ion-card>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script lang="ts">
import { IonCard, IonCol, IonRow, IonGrid } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Intro',
    components: {
        IonCard,
        IonCol,
        IonRow,
        IonGrid,
    },
});
</script>

<style scoped></style>
