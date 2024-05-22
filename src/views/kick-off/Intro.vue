<template>
    <ion-row class="display-flex ion-justify-content-center ion-align-items-center">
        <ion-col sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="3" sizeXl="2">
            <ion-card class="margin-top-bottom-unset ion-padding">
                <ion-card-subtitle>
                    Ever wonder why you still remember the meaning of the words you learned in your childhood but
                    struggle with a vocab learned a few days or weeks back?
                </ion-card-subtitle>
            </ion-card>
        </ion-col>
        <ion-col sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="3" sizeXl="2">
            <ion-card class="margin-top-bottom-unset ion-padding">
                <ion-card-subtitle>
                    According to science, <strong>spaced repetition</strong> is one of the techniques to retain anything
                    in the long term. The Leitner system works based on this principle. It suggests creating a
                    <strong>flashcard</strong> for each item and reviewing those at an interval.
                </ion-card-subtitle>
            </ion-card>
        </ion-col>
        <ion-col sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="3" sizeXl="2">
            <ion-card class="margin-top-bottom-unset ion-padding">
                <ion-card-subtitle>
                    Join us to embed newly introduced words in your long-term memory.
                </ion-card-subtitle>
            </ion-card>
        </ion-col>

        <ion-col sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="3" sizeXl="2">
            <ion-card class="margin-top-bottom-unset ion-padding">
                <ion-card-subtitle>
                    Don't miss the <strong>word guessing game</strong> to challenge yourself to think critically and
                    make connections between words and meanings to enhance your cognitive abilities. It's a fun and
                    engaging way to learn.
                </ion-card-subtitle>
            </ion-card>
        </ion-col>
    </ion-row>
</template>

<script lang="ts">
import { IonCard, IonCol, IonRow, IonCardSubtitle } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Intro',
    components: {
        IonCard,
        IonCol,
        IonRow,
        IonCardSubtitle,
    },
});
</script>

<style scoped></style>
