<template>
    <ion-page>
        <firecracker-header
            header-title="Guessing Game"
            content-id="guessing-game"
            menu-id="guessing-game-menu"
            type="MENU"
        />
        <ion-content :fullscreen="true" id="guessing-game">
            <ion-row class="display-flex ion-justify-content-center ion-padding-top">
                <ion-col sizeXs="12" sizeSm="10" sizeMd="8" sizeLg="6" sizeXl="6">
                    <spinner v-if="isLoading" />
                    <div v-if="!isLoading && vocabularies.length" class="ion-padding-start ion-padding-end">
                        <ion-card-subtitle class="ion-text-center ion-padding-bottom">
                            {{ vocabularies[currentVocabularyIndex].meaning }}
                        </ion-card-subtitle>
                        <ion-textarea
                            placeholder="Guess the word"
                            inputmode="text"
                            :value="givenAnswer"
                            @ionChange="givenAnswer = $event.target.value"
                        />
                        <ion-card-subtitle class="ion-padding-top ion-text-end">
                            {{ resultMessage }}
                        </ion-card-subtitle>
                        <div class="display-flex ion-justify-content-end ion-padding-top">
                            <ion-button @click="checkAnswer()">Check</ion-button>
                            <ion-button @click="onClickPrevious()">Previous</ion-button>
                            <ion-button @click="onClickNext()">Next</ion-button>
                        </div>
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
            currentVocabularyIndex: 0,
            givenAnswer: '',
            resultMessage: '',
        };
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clean();
    },
    methods: {
        async init(): Promise<void> {
            const cachedRandomlyChosenMeaningResponse = await NativeStorage.getGuessingGameVocabularies();
            const today = format(new Date(), 'yyyy-MM-dd');
            if (cachedRandomlyChosenMeaningResponse?.createdAt !== today) {
                await NativeStorage.removeGuessingGameVocabularies().catch();
                await this.loadVocabularies();
            } else {
                this.vocabularies = cachedRandomlyChosenMeaningResponse.data;
            }
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
            } finally {
                this.isLoading = false;
            }
        },

        checkAnswer(): void {
            const correctVocabulary = this.vocabularies[this.currentVocabularyIndex];
            if (this.givenAnswer.trim().toLowerCase() === correctVocabulary.word.trim().toLowerCase()) {
                this.resultMessage = 'Correct!';
                this.playSound(this.correctSound);
            } else {
                this.resultMessage = `Incorrect. The correct word is "${
                    this.vocabularies[this.currentVocabularyIndex].word
                }".`;
                this.playSound(this.incorrectSound);
            }
        },

        onClickNext(): void {
            this.currentVocabularyIndex += 1;
            if (this.currentVocabularyIndex >= this.vocabularies.length) {
                this.currentVocabularyIndex = 0;
            }
            this.resultMessage = '';
            this.givenAnswer = '';
        },

        onClickPrevious(): void {
            this.currentVocabularyIndex -= 1;
            if (this.currentVocabularyIndex < 0) {
                this.currentVocabularyIndex = 0;
            }
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
            this.currentVocabularyIndex = 0;
        },
    },
});
</script>

<style scoped></style>
