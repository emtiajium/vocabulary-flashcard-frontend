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
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6" sizeXl="6">
                    <spinner v-if="isLoading" />
                    <div v-if="!isLoading && vocabularies.length">
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
                            <ion-button @click="onClickNextButton()">Next</ion-button>
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
        await this.loadVocabularies();
    },
    methods: {
        async loadVocabularies(): Promise<void> {
            try {
                this.vocabularies = await HttpHandler.get<RandomlyChosenMeaningResponse[]>(
                    `/v1/vocabularies/definitions/random-search`,
                );
            } catch {
                await Toast.present(MessageDB.genericError);
            } finally {
                this.isLoading = false;
            }
        },

        checkAnswer(): void {
            const correctVocabulary = this.vocabularies.find(
                (vocabulary) => vocabulary.word === this.vocabularies[this.currentVocabularyIndex].word,
            );

            if (this.givenAnswer.trim().toLowerCase() === correctVocabulary?.word.trim().toLowerCase()) {
                this.resultMessage = 'Correct!';
                this.playSound(this.correctSound);
            } else {
                this.resultMessage = `Incorrect. The correct word is "${
                    this.vocabularies[this.currentVocabularyIndex].word
                }".`;
                this.playSound(this.incorrectSound);
            }
        },

        onClickNextButton(): void {
            this.currentVocabularyIndex += 1;
            if (this.currentVocabularyIndex >= this.vocabularies.length) {
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
    },
});
</script>

<style scoped></style>
