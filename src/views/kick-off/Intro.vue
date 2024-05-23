<template>
    <ion-card v-if="currentIndex === 0" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <thinking-icon
                :fill-color-variable="'--ion-color-primary'"
                :stroke-color-variable="'--ion-color-primary'"
                class="icon-container"
            />
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            Ever wonder why you still remember the meaning of the words you learned in your childhood but struggle with
            a vocab learned a few days or weeks back?
        </ion-card-title>
    </ion-card>

    <ion-card v-if="currentIndex === 1" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <box-icon
                :fill-color-variable="'--ion-color-primary'"
                :stroke-color-variable="'--ion-color-primary'"
                class="icon-container"
            />
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            According to science, <strong>spaced repetition</strong> is one of the techniques to retain anything in the
            long term. The Leitner system works based on this principle. It suggests creating a
            <strong>flashcard</strong> for each item and reviewing those at an interval.
        </ion-card-title>
    </ion-card>

    <ion-card v-if="currentIndex === 2" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <join-us-icon
                :fill-color-variable="'--ion-color-primary'"
                :stroke-color-variable="'--ion-color-primary'"
                class="icon-container"
            />
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            Join us to embed newly introduced words in your long-term memory.
        </ion-card-title>
    </ion-card>

    <ion-card v-if="currentIndex === 3" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <fun-icon
                :fill-color-variable="'--ion-color-primary'"
                :stroke-color-variable="'--ion-color-primary'"
                class="icon-container"
            />
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            Don't miss the <strong>word guessing game</strong> to challenge yourself to think critically and make
            connections between words and meanings to enhance your cognitive abilities. It's a fun and engaging way to
            learn.
        </ion-card-title>
    </ion-card>
</template>

<script lang="ts">
import { IonCard, IonCardTitle } from '@ionic/vue';
import { defineComponent } from 'vue';
import ThinkingIcon from '@/media/ThinkingIcon.vue';
import JoinUsIcon from '@/media/JoinUsIcon.vue';
import FunIcon from '@/media/FunIcon.vue';
import BoxIcon from '@/media/BoxIcon.vue';

export default defineComponent({
    name: 'Intro',
    components: {
        BoxIcon,
        FunIcon,
        JoinUsIcon,
        ThinkingIcon,
        IonCard,
        IonCardTitle,
    },
    props: ['currentIndex'],
});
</script>

<style scoped>
.icon-container {
    width: 50%;
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {
    .icon-container {
        width: 40%;
    }
}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {
    .icon-container {
        width: 30%;
    }
}
</style>
