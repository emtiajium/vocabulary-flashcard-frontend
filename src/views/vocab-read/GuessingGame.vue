<template>
    <ion-page>
        <firecracker-header
            header-title="Guessing Word"
            content-id="guessing-game"
            menu-id="guessing-game-menu"
            type="MENU"
        />
        <ion-content :fullscreen="true" id="guessing-game">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="10" sizeMd="8" sizeLg="6" sizeXl="6">
                    <spinner v-if="isLoading" />

                    <div v-if="isLoading" class="ion-padding-start ion-padding-end">
                        <ion-card-subtitle class="ion-text-center">
                            Preparing the guessing game for today ...
                        </ion-card-subtitle>
                    </div>

                    <div class="swiper" v-show="!isLoading && vocabularies.length">
                        <div class="swiper-wrapper">
                            <div v-for="(vocabulary, index) of vocabularies" :key="index" class="swiper-slide">
                                <div class="ion-padding ion-margin-bottom">
                                    <div
                                        class="
                                            display-flex
                                            ion-justify-content-between ion-align-items-center ion-padding-bottom
                                        "
                                    >
                                        <div>
                                            <font-awesome-icon
                                                v-if="typeof vocabulary.isCorrect === 'boolean'"
                                                :icon="vocabulary.isCorrect ? correctIcon : incorrectIcon"
                                                :class="`${
                                                    vocabulary.isCorrect
                                                        ? 'firecracker-primary-color-icon'
                                                        : 'firecracker-warning-color-icon'
                                                } icon-font`"
                                            />
                                        </div>
                                        <div>
                                            <ion-card-subtitle
                                                class="ion-text-end"
                                                :aria-label="`${correctAnswerCount} correct words out of ${vocabularies.length}`"
                                            >
                                                <span class="correct-count"> {{ correctAnswerCount }} </span> /
                                                {{ vocabularies.length }}
                                            </ion-card-subtitle>
                                        </div>
                                    </div>

                                    <ion-card-header>
                                        <ion-card-title class="ion-text-center capitalize ion-padding-bottom">
                                            {{ vocabulary.meaning }}
                                        </ion-card-title>
                                    </ion-card-header>

                                    <div
                                        class="
                                            display-flex
                                            ion-justify-content-between ion-align-items-center
                                            submit-answer-container
                                            ion-margin-bottom
                                        "
                                    >
                                        <ion-textarea
                                            class="no-border"
                                            placeholder="Guess the word"
                                            inputmode="text"
                                            autocapitalize="sentences"
                                            :auto-grow="true"
                                            :value="givenAnswer"
                                            @ionChange="onGivingAnswer($event.target.value)"
                                        />
                                        <ion-button
                                            aria-label="Show the correct word"
                                            fill="clear"
                                            size="large"
                                            shape="round"
                                            color="primary"
                                            :strong="true"
                                            @click="showCorrectAnswer = true"
                                        >
                                            <font-awesome-icon
                                                :icon="viewIcon"
                                                class="firecracker-primary-color-icon"
                                            />
                                        </ion-button>
                                        <ion-button
                                            aria-label="Submit the answer"
                                            fill="clear"
                                            size="large"
                                            shape="round"
                                            color="primary"
                                            class="ion-padding-end"
                                            :strong="true"
                                            @click="submitAnswer(vocabulary, index)"
                                        >
                                            <font-awesome-icon :icon="submitIcon" />
                                        </ion-button>
                                    </div>

                                    <div
                                        v-if="resultMessage && !showCorrectAnswer"
                                        class="
                                            display-flex
                                            ion-justify-content-between ion-align-items-center ion-padding-bottom
                                        "
                                    >
                                        <div>
                                            <font-awesome-icon
                                                :icon="vocabulary.isCorrect ? correctIcon : incorrectIcon"
                                                :class="`${
                                                    vocabulary.isCorrect
                                                        ? 'firecracker-primary-color-icon'
                                                        : 'firecracker-warning-color-icon'
                                                } icon-font`"
                                            />
                                        </div>
                                        <div>
                                            <ion-card-subtitle>
                                                {{ resultMessage }}
                                            </ion-card-subtitle>
                                        </div>
                                    </div>

                                    <div
                                        v-if="showCorrectAnswer"
                                        class="
                                            display-flex
                                            ion-justify-content-between ion-align-items-center ion-padding-bottom
                                        "
                                    >
                                        <div>
                                            <font-awesome-icon
                                                :icon="infoIcon"
                                                class="firecracker-primary-color-icon icon-font"
                                            />
                                        </div>
                                        <div>
                                            <ion-card-subtitle>
                                                The correct word is "<span class="capitalize">{{
                                                    vocabulary.word
                                                }}</span
                                                >".
                                            </ion-card-subtitle>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </ion-col>
            </ion-row>

            <ion-modal
                :is-open="isInfoModalOpened"
                :initial-breakpoint="0.25"
                :breakpoints="[0, 0.25, 0.5, 0.75]"
                @willDismiss="isInfoModalOpened = false"
            >
                <div class="ion-padding">
                    <ion-card-subtitle class="ion-text-center">
                        In this Vocabulary Guessing Game, you'll be presented with a series of meanings to guess the
                        correct word for each one. Each day, a new game will be generated for you to challenge your
                        vocabulary skills. For every correct guess, your score will increase. If you successfully guess
                        all the words correctly, you'll unlock another game to play even on the same day. Challenge
                        yourself daily and see how many words you can get right!
                    </ion-card-subtitle>
                </div>
            </ion-modal>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button @click="isInfoModalOpened = true">
                    <font-awesome-icon :icon="ideaIcon" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage,
    IonContent,
    IonRow,
    IonCol,
    IonTextarea,
    IonButton,
    IonCardSubtitle,
    IonFab,
    IonFabButton,
    IonModal,
    IonCardTitle,
    IonCardHeader,
} from '@ionic/vue';
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faCircleCheck,
    faLightbulb,
    faCircleXmark,
    faCircleArrowUp,
    faEye,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { cloneDeep, isEmpty } from 'lodash';

export default defineComponent({
    name: 'GuessingGame',
    components: {
        IonFabButton,
        IonFab,
        FirecrackerHeader,
        IonPage,
        IonContent,
        IonRow,
        IonCol,
        IonTextarea,
        Spinner,
        IonButton,
        IonCardSubtitle,
        FontAwesomeIcon,
        IonModal,
        IonCardTitle,
        IonCardHeader,
    },
    data() {
        return {
            correctIcon: faCircleCheck,
            incorrectIcon: faCircleXmark,
            ideaIcon: faLightbulb,
            submitIcon: faCircleArrowUp,
            viewIcon: faEye,
            infoIcon: faInfoCircle,
            correctSound: {} as HTMLAudioElement,
            incorrectSound: {} as HTMLAudioElement,
            isLoading: true,
            vocabularies: [] as RandomlyChosenMeaningResponse[],
            givenAnswer: '',
            resultMessage: '',
            showCorrectAnswer: false,
            correctAnswerCount: 0,
            swiper: {} as Swiper,
            isInfoModalOpened: false,
        };
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.storeInCache(cloneDeep(this.vocabularies));
        this.clean();
        this.swiper.destroy();
        this.swiper.disable();
    },
    methods: {
        async init(): Promise<void> {
            this.initSwiper();
            await this.assertLoadingVocabularies();
            this.swiper.init();
            this.initAudioClips();
        },

        initSwiper(): void {
            this.swiper = new Swiper('.swiper', {
                modules: [Pagination],
                init: false,
                rewind: true,
                spaceBetween: 10,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    type: 'bullets',
                    dynamicBullets: true,
                    dynamicMainBullets: 5,
                    renderBullet: (index: number, className: string): string => {
                        return `<span class="${className}">${index + 1}</span>`;
                    },
                },
            });

            this.swiper.on('realIndexChange', (swiper: Swiper) => {
                this.onChangeVocabulary(swiper.activeIndex);
            });
        },

        initAudioClips(): void {
            try {
                this.correctSound = new Audio('/assets/audio-clips/correct-answer.mp3');
                this.incorrectSound = new Audio('/assets/audio-clips/wrong-answer.mp3');
            } catch {
                // do nothing
            }
        },

        async assertLoadingVocabularies(): Promise<void> {
            this.isLoading = true;
            const cachedRandomlyChosenMeaningResponse = await NativeStorage.getGuessingGameVocabularies();
            const today = format(new Date(), 'yyyy-MM-dd');
            if (cachedRandomlyChosenMeaningResponse?.createdAt !== today) {
                NativeStorage.removeGuessingGameVocabularies().catch();
                await this.loadVocabularies();
            } else {
                this.vocabularies = cachedRandomlyChosenMeaningResponse.data;
                this.calculateCorrectAnswerCount();
            }
            this.setInitialGivenAnswer();
            this.isLoading = false;
        },

        async loadVocabularies(): Promise<void> {
            try {
                const vocabularies = await HttpHandler.get<RandomlyChosenMeaningResponse[]>(
                    `/v1/vocabularies/definitions/random-search`,
                );
                this.vocabularies = vocabularies;
                this.storeInCache(vocabularies);
            } catch {
                await Toast.present(MessageDB.genericError);
            }
        },

        submitAnswer(correctVocabulary: RandomlyChosenMeaningResponse, index: number): void {
            this.showCorrectAnswer = false;
            let isCorrect = false;
            const previousCorrectAnswerCount = this.correctAnswerCount;
            this.givenAnswer = this.givenAnswer.trim().toLowerCase();
            if (this.givenAnswer === correctVocabulary.word.trim().toLowerCase()) {
                isCorrect = true;
                this.resultMessage = 'Correct!';
                this.playSound(this.correctSound);
                this.vocabularies[index].isCorrect = true;
            } else {
                this.resultMessage = `Incorrect!`;
                this.playSound(this.incorrectSound);
                this.vocabularies[index].isCorrect = this.givenAnswer ? false : undefined;
            }
            this.calculateCorrectAnswerCount();
            if (this.correctAnswerCount !== previousCorrectAnswerCount) {
                this.animateCount(index);
            }
            if (this.correctAnswerCount === this.vocabularies.length) {
                NativeStorage.removeGuessingGameVocabularies().catch();
            } else {
                this.storeInCache(cloneDeep(this.vocabularies));
            }
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

        setInitialGivenAnswer(): void {
            this.givenAnswer = this.vocabularies[0].isCorrect ? this.vocabularies[0].word : '';
        },

        onChangeVocabulary(index: number): void {
            this.resultMessage = '';
            this.givenAnswer = this.vocabularies[index].isCorrect ? this.vocabularies[index].word : '';
            this.showCorrectAnswer = false;
        },

        onGivingAnswer(givenAnswer: string): void {
            this.givenAnswer = givenAnswer;
        },

        playSound(sound: HTMLAudioElement): void {
            try {
                sound.pause();
                // eslint-disable-next-line no-param-reassign
                sound.currentTime = 0;
                sound.play();
            } catch {
                // do nothing
                // I noticed sometimes (in the Android app), an error is thrown
                // "NotSupportedError: The element has no supported sources"
            }
        },

        storeInCache(vocabularies: RandomlyChosenMeaningResponse[]): void {
            if (!isEmpty(vocabularies)) {
                const today = format(new Date(), 'yyyy-MM-dd');
                NativeStorage.setGuessingGameVocabularies({
                    createdAt: today,
                    data: vocabularies,
                }).finally();
            }
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

.submit-answer-container {
    border: thin solid var(--text-area-border-color);
    border-radius: var(--default-border-radius);
}

@keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-30px);
    }
    60% {
        transform: translateY(-15px);
    }
}

.animate-count {
    display: inline-block;
    animation: bounce 1s ease-out;
}

.icon-font {
    font-size: 20px;
}
</style>
