<template>
    <ion-page>
        <firecracker-header
            header-title="Guessing Game"
            content-id="guessing-game"
            menu-id="guessing-game-menu"
            type="MENU"
        />
        <ion-content :fullscreen="true" id="guessing-game">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="10" sizeMd="8" sizeLg="6" sizeXl="6">
                    <spinner v-if="isLoading" />

                    <div v-if="isLoading" class="ion-padding-start ion-padding-end">
                        <ion-card-subtitle class="ion-text-center"> Preparing the guessing game ... </ion-card-subtitle>
                    </div>

                    <div class="swiper" v-show="!isLoading && vocabularies.length">
                        <div class="swiper-wrapper">
                            <div v-for="(vocabulary, index) of vocabularies" :key="index" class="swiper-slide">
                                <div class="ion-padding ion-margin-bottom">
                                    <ion-card-subtitle class="ion-text-end ion-padding-bottom">
                                        <span class="correct-count"> {{ correctAnswerCount }} </span> /
                                        {{ vocabularies.length }}
                                    </ion-card-subtitle>
                                    <ion-card-subtitle class="ion-text-center ion-padding-bottom">
                                        {{ vocabulary.meaning }}
                                    </ion-card-subtitle>
                                    <ion-textarea
                                        placeholder="Guess the word"
                                        inputmode="text"
                                        :auto-grow="true"
                                        :value="givenAnswer"
                                        @ionChange="givenAnswer = $event.target.value"
                                    />
                                    <ion-card-subtitle class="ion-padding-top ion-text-center" v-if="resultMessage">
                                        {{ resultMessage }}
                                    </ion-card-subtitle>
                                    <div class="display-flex ion-justify-content-end ion-padding-top">
                                        <ion-button
                                            aria-label="Check the answer"
                                            size="small"
                                            @click="checkAnswer(vocabulary, index)"
                                        >
                                            Check
                                        </ion-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonRow, IonCol, IonTextarea, IonButton, IonCardSubtitle } from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import Spinner from '@/views/shared/Spinner.vue';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import MessageDB from '@/utils/MessageDB';
import { RandomlyChosenMeaningResponse } from '@/domains/RandomlyChosenMeaningResponse';
import { format } from 'date-fns';
import NativeStorage from '@/utils/NativeStorage';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

export default defineComponent({
    name: 'GuessingGame',
    components: {
        FirecrackerHeader,
        IonPage,
        IonContent,
        IonRow,
        IonCol,
        IonTextarea,
        Spinner,
        IonButton,
        IonCardSubtitle,
    },
    data() {
        return {
            correctSound: new Audio('/assets/audio-clips/correct-answer.mp3'),
            incorrectSound: new Audio('/assets/audio-clips/wrong-answer.mp3'),
            isLoading: true,
            vocabularies: [] as RandomlyChosenMeaningResponse[],
            givenAnswer: '',
            resultMessage: '',
            correctAnswerCount: 0,
            swiper: {} as Swiper,
        };
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clean();
        this.swiper.destroy();
        this.swiper.disable();
    },
    methods: {
        async init(): Promise<void> {
            this.initSwiper();
            await this.loadVocabularies();
            this.isLoading = false;
            this.swiper.init();
        },

        initSwiper(): void {
            this.swiper = new Swiper('.swiper', {
                modules: [Pagination],
                init: false,
                loop: true,
                rewind: true,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    type: 'bullets',
                    dynamicBullets: true,
                    dynamicMainBullets: 10,
                    renderBullet: (index: number, className: string): string => {
                        return `<span class="${className}">${index + 1}</span>`;
                    },
                },
            });

            this.swiper.on('realIndexChange', (a: string) => {
                this.onChangeVocabulary();
            });
        },

        async loadVocabularies(): Promise<void> {
            try {
                const vocabularies = await HttpHandler.get<RandomlyChosenMeaningResponse[]>(
                    `/v1/vocabularies/definitions/random-search`,
                );
                this.vocabularies = vocabularies;
                const today = format(new Date(), 'yyyy-MM-dd');
                await NativeStorage.setGuessingGameVocabularies({
                    createdAt: today,
                    data: vocabularies,
                });
            } catch {
                await Toast.present(MessageDB.genericError);
            }
        },

        /* eslint-disable no-param-reassign */
        checkAnswer(correctVocabulary: RandomlyChosenMeaningResponse, index: number): void {
            let isCorrect = false;
            if (this.givenAnswer.trim().toLowerCase() === correctVocabulary.word.trim().toLowerCase()) {
                isCorrect = true;
                this.resultMessage = 'Correct!';
                this.playSound(this.correctSound);
                correctVocabulary.isCorrect = true;
            } else {
                this.resultMessage = `Incorrect. The correct word is "${correctVocabulary.word}".`;
                this.playSound(this.incorrectSound);
                correctVocabulary.isCorrect = false;
            }
            this.calculateCorrectAnswerCount();
            if (isCorrect) {
                this.animateCount(index);
            }
            /* eslint-enable no-param-reassign */
        },

        calculateCorrectAnswerCount(): void {
            this.correctAnswerCount = this.vocabularies.reduce((accumulator, currentValue) => {
                return currentValue.isCorrect ? accumulator + 1 : accumulator;
            }, 0);
        },

        animateCount(index: number): void {
            const element = document.getElementsByClassName('correct-count')[index];
            element.classList.add('animate-count');
            element.addEventListener(
                'animationend',
                () => {
                    element.classList.remove('animate-count');
                },
                { once: true },
            );
        },

        onChangeVocabulary(): void {
            this.resultMessage = '';
            this.givenAnswer = '';
        },

        playSound(sound: HTMLAudioElement): void {
            sound.pause();
            // eslint-disable-next-line no-param-reassign
            sound.currentTime = 0;
            sound.play();
        },

        clean(): void {
            this.isLoading = true;
            this.vocabularies = [];
            this.givenAnswer = '';
            this.resultMessage = '';
            this.correctAnswerCount = 0;
        },
    },
});
</script>

<style scoped>
.swiper {
    width: calc(100% - var(--ion-margin) / 4 - var(--ion-margin) / 4);
    height: 100%;
    border-radius: var(--default-border-radius);
}

.swiper-slide {
    background: var(--ion-card-background);
    border-radius: var(--default-border-radius);
}

@keyframes update-count {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.5);
    }
    100% {
        transform: scale(1);
    }
}

.animate-count {
    display: inline-block;
    animation: update-count 0.5s ease-out;
}
</style>
