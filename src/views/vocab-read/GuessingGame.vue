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
                        <ion-card-subtitle class="ion-text-center ion-padding-bottom">
                            Preparing the guessing game for today ...
                        </ion-card-subtitle>
                    </div>

                    <div class="swiper ion-margin-start ion-margin-end" v-show="!isLoading && vocabularies.length">
                        <div class="swiper-wrapper">
                            <div v-for="(vocabulary, index) of vocabularies" :key="index" class="swiper-slide">
                                <div class="ion-padding ion-margin">
                                    <ion-card-subtitle class="ion-text-center ion-padding-bottom">
                                        {{ vocabulary.meaning }}
                                    </ion-card-subtitle>
                                    <div class="ion-padding-start ion-padding-end">
                                        <ion-textarea
                                            placeholder="Guess the word"
                                            inputmode="text"
                                            :auto-grow="true"
                                            :value="givenAnswer"
                                            @ionChange="givenAnswer = $event.target.value"
                                        />
                                    </div>
                                    <ion-card-subtitle
                                        class="ion-padding-top ion-padding-start ion-padding-end ion-text-center"
                                    >
                                        {{ resultMessage }}
                                    </ion-card-subtitle>
                                    <div
                                        class="
                                            display-flex
                                            ion-justify-content-end ion-padding-top ion-padding-bottom ion-padding-end
                                        "
                                    >
                                        <ion-button aria-label="Check the answer" @click="checkAnswer(vocabulary)">
                                            Check
                                        </ion-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-button-next"></div>
                        <div class="swiper-button-prev"></div>
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
import { Navigation, Pagination } from 'swiper/modules';

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
                modules: [Navigation, Pagination],
                init: false,
                loop: true,
                rewind: true,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
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

            // this.swiper.on('slideChange', (a: string) => {
            //     console.log('a', a);
            // });

            this.swiper.on('navigationNext', () => {
                this.onChangeVocabulary();
            });

            this.swiper.on('navigationPrev', () => {
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

        checkAnswer(correctVocabulary: RandomlyChosenMeaningResponse): void {
            if (this.givenAnswer.trim().toLowerCase() === correctVocabulary.word.trim().toLowerCase()) {
                this.resultMessage = 'Correct!';
                this.playSound(this.correctSound);
            } else {
                this.resultMessage = `Incorrect. The correct word is "${correctVocabulary.word}".`;
                this.playSound(this.incorrectSound);
            }
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
        },
    },
});
</script>

<style scoped>
.swiper {
    width: 100%;
    height: 100%;
}

.swiper-slide {
    background: var(--ion-card-background);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--default-border-radius);
}
</style>
