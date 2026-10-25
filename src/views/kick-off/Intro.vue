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
            Ever wonder why you can remember words you learned as a child but forget new ones after just a few days?
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
            That's where <strong>spaced repetition</strong> comes in! The <strong>Leitner system</strong> helps you
            remember words by reviewing <strong>flashcards</strong> at intervals based on how well you remember them.
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
            Make learning more fun with our <strong>word guessing game</strong>! Use clues to find the right word and
            reinforce what you've learned.
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
