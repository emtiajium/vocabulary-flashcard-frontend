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
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <div class="container">
                        <div id="question">
                            {{ vocabularies[currentQuestionIndex].meaning }}
                        </div>
                        <div id="options">
                            <ion-textarea
                                placeholder="Guess the word"
                                @ionChange="givenAnswer = $event.target.value"
                            ></ion-textarea>
                        </div>
                        <div id="result">{{ resultMessage }}</div>
                        <div class="display-flex ion-justify-content-around">
                            <button @click="checkAnswer()">Check</button>
                            <button id="next-btn" @click="onClickNextButton">Next</button>
                        </div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonRow, IonCol, IonTextarea } from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';

export default defineComponent({
    name: 'GuessingGame',
    components: {
        FirecrackerHeader,
        IonPage,
        IonContent,
        IonRow,
        IonCol,
        IonTextarea,
    },
    data() {
        return {
            vocabularies: [
                { meaning: 'to make clear or easier to understand', word: 'clarify' },
                { meaning: 'a spoken or written account of connected events', word: 'narrative' },
                { meaning: 'a person or thing that represents an idea or quality', word: 'symbol' },
                { meaning: 'to give or hand over (something) to someone else', word: 'delegate' },
                { meaning: 'existing at the same time or happening at the same time', word: 'simultaneous' },
            ],
            currentQuestionIndex: 0,
            resultMessage: '',
            correctSound: new Audio('/assets/audio-clips/correct-answer.mp3'),
            incorrectSound: new Audio('/assets/audio-clips/wrong-answer.mp3'),
            givenAnswer: '',
        };
    },
    async ionViewDidEnter() {
        console.log('here!');
    },
    methods: {
        checkAnswer(): void {
            const correctVocabulary = this.vocabularies.find(
                (item) => item.word === this.vocabularies[this.currentQuestionIndex].word,
            );

            if (this.givenAnswer.trim().toLowerCase() === correctVocabulary?.word.trim().toLowerCase()) {
                this.resultMessage = 'Correct!';
                this.playSound(this.correctSound);
            } else {
                this.resultMessage = `Incorrect. The correct answer is "${
                    this.vocabularies[this.currentQuestionIndex].word
                }".`;
                this.playSound(this.incorrectSound);
            }
        },

        onClickNextButton(): void {
            this.currentQuestionIndex += 1;
            if (this.currentQuestionIndex >= this.vocabularies.length) {
                this.currentQuestionIndex = 0;
            }
            this.resultMessage = '';
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

<style scoped>
.container {
    max-width: 600px;
    margin: 0 auto;
}

h1 {
    margin-bottom: 30px;
}

#options {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.option {
    margin: 5px;
    padding: 10px 20px;
    border: 2px solid #333;
    cursor: pointer;
    transition: background-color 0.3s;
}

.option:hover {
    background-color: #f0f0f0;
}

#next-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #333;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
}

#next-btn:hover {
    background-color: #555;
}

#result {
    margin-top: 20px;
}
</style>
