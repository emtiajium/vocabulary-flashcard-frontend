<template>
    <view>
        <ion-card class="ion-padding">
            Ever wonder why you still remember the meaning of the words you learned in your childhood but struggle for a
            vocab learned a few days or weeks back?
        </ion-card>
        <ion-card class="ion-padding">
            According to scientists, spaced repetition is one of the techniques to memorize anything in the long term.
            Among many approaches based on its principle, the Leitner system is one. It suggests creating a
            <strong>flashcard</strong>
            for each item and reviewing those at an interval. This excellent app lets you permanently embed newly
            introduced words in your long-term memory through the steps of the Leitner system.
        </ion-card>
    </view>
</template>

<script lang="ts">
import { IonCard } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Intro',
    components: {
        IonCard,
    },
});
</script>

<style scoped></style>
