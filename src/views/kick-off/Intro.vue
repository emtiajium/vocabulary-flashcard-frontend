<template>
    <ion-card v-if="currentIndex === 0" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <lottie-animation class="icon-container" :animation-data="retentionAnimation">
                <template #fallback>
                    <thinking-icon
                        :fill-color-variable="'--ion-color-primary'"
                        :stroke-color-variable="'--ion-color-primary'"
                    />
                </template>
            </lottie-animation>
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            Ever wonder why you still remember the meaning of the words you learned in your childhood but struggle with
            a vocab learned a few days or weeks back?
        </ion-card-title>
    </ion-card>

    <ion-card v-if="currentIndex === 1" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <lottie-animation class="icon-container" :animation-data="spacedRepetitionAnimation">
                <template #fallback>
                    <box-icon
                        :fill-color-variable="'--ion-color-primary'"
                        :stroke-color-variable="'--ion-color-primary'"
                    />
                </template>
            </lottie-animation>
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            According to science, <strong>spaced repetition</strong> is one of the techniques to retain anything in the
            long term. The Leitner system works based on this principle. It suggests creating a
            <strong>flashcard</strong> for each item and reviewing those at an interval.
        </ion-card-title>
    </ion-card>

    <ion-card v-if="currentIndex === 2" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <lottie-animation class="icon-container" :animation-data="joinUsAnimation">
                <template #fallback>
                    <join-us-icon
                        :fill-color-variable="'--ion-color-primary'"
                        :stroke-color-variable="'--ion-color-primary'"
                    />
                </template>
            </lottie-animation>
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            Learning is better together! Join a cohort, discover new words, and strengthen your vocabulary through
            regular practice.
        </ion-card-title>
    </ion-card>

    <ion-card v-if="currentIndex === 3" class="margin-top-bottom-unset">
        <div class="display-flex ion-justify-content-center">
            <lottie-animation class="icon-container" :animation-data="funGameAnimation">
                <template #fallback>
                    <fun-icon
                        :fill-color-variable="'--ion-color-primary'"
                        :stroke-color-variable="'--ion-color-primary'"
                    />
                </template>
            </lottie-animation>
        </div>
        <ion-card-title class="ion-padding-top ion-text-center">
            To make your learning experience more enjoyable and effective, try our <strong>word guessing game</strong>.
            This fun and engaging activity challenges you to think critically and make connections between words and
            their meanings, enhancing your cognitive abilities while reinforcing what you've learned through spaced
            repetition.
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
import LottieAnimation from '@/media/LottieAnimation.vue';
import retention from '@/media/lottie/retention.json';
import spacedRepetition from '@/media/lottie/spaced-repetition.json';
import joinUs from '@/media/lottie/join-us.json';
import funGame from '@/media/lottie/fun-game.json';

export default defineComponent({
    name: 'Intro',
    components: {
        BoxIcon,
        FunIcon,
        JoinUsIcon,
        ThinkingIcon,
        LottieAnimation,
        IonCard,
        IonCardTitle,
    },
    props: ['currentIndex'],
    data() {
        return {
            retentionAnimation: retention,
            spacedRepetitionAnimation: spacedRepetition,
            joinUsAnimation: joinUs,
            funGameAnimation: funGame,
        };
    },
});
</script>

<style scoped>
strong {
    color: var(--ion-color-primary);
    font-weight: var(--font-weight-semibold);
}

ion-card {
    --background: transparent;
    border: none;
    box-shadow: none;
}

ion-card-title {
    font-size: clamp(1.125rem, 1.05rem + 0.5vw, 1.35rem);
    line-height: var(--leading-normal);
    font-weight: var(--font-weight-medium);
    --color: var(--ion-card-title-color);
}

.icon-container {
    width: 50%;
    max-width: 220px;
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
