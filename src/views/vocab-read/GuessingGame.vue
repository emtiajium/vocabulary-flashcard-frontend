<template>
    <ion-page>
        <firecracker-header
            header-title="Guessing Word"
            content-id="guessing-game"
            menu-id="guessing-game-menu"
            type="MENU"
        />
        <ion-content :fullscreen="true" id="guessing-game">
            <div class="game-shell">
                <!-- The play surface stays mounted (hidden) so the swiper it owns is
                     always in the DOM by the time `initSwiper` runs. -->
                <section v-show="showGame" class="game-progress" aria-labelledby="game-progress-label">
                    <div class="game-progress__head">
                        <p id="game-progress-label" class="game-progress__label">
                            Word <strong>{{ activeIndex + 1 }}</strong> of {{ vocabularies.length }}
                        </p>
                        <ion-chip
                            class="game-score"
                            :aria-label="`${correctAnswerCount} correct out of ${vocabularies.length}`"
                        >
                            <font-awesome-icon
                                :icon="correctIcon"
                                class="firecracker-primary-color-icon game-score__icon"
                                aria-hidden="true"
                            />
                            <span :key="scorePulseKey" class="game-score__value">{{ correctAnswerCount }}</span>
                            <span>/ {{ vocabularies.length }}</span>
                        </ion-chip>
                    </div>

                    <div class="game-progress__track">
                        <div class="game-progress__fill" :style="{ width: `${progressPercent}%` }"></div>
                    </div>

                    <div class="game-hint">
                        <span>Read the meaning, then type the word.</span>
                        <ion-button
                            class="game-hint__link"
                            fill="clear"
                            size="small"
                            color="primary"
                            @click="isInfoModalOpened = true"
                        >
                            How it works
                        </ion-button>
                    </div>
                </section>

                <div v-show="showGame" class="game-stage">
                    <div class="game-viewport">
                        <div class="swiper">
                            <div class="swiper-wrapper">
                                <div v-for="(vocabulary, index) of vocabularies" :key="index" class="swiper-slide">
                                    <div class="game-card__body">
                                        <p class="game-card__eyebrow">Meaning</p>
                                        <p class="game-card__prompt">{{ vocabulary.meaning }}</p>
                                    </div>

                                    <div class="game-answer">
                                        <p v-if="vocabulary.isCorrect" class="game-locked">
                                            <font-awesome-icon :icon="correctIcon" aria-hidden="true" />
                                            <span>{{ vocabulary.word }}</span>
                                        </p>
                                        <template v-else>
                                            <ion-textarea
                                                class="game-answer__field"
                                                :aria-label="`Your answer for word ${index + 1}`"
                                                placeholder="Type the word"
                                                inputmode="text"
                                                enterkeyhint="done"
                                                autocapitalize="sentences"
                                                autocomplete="off"
                                                autocorrect="off"
                                                :spellcheck="false"
                                                :auto-grow="true"
                                                :rows="1"
                                                :value="givenAnswers[index]"
                                                @ionInput="onGivingAnswer($event.detail.value as string, index)"
                                                @keydown.enter.prevent="submitAnswer(vocabulary, index)"
                                            >
                                                <!-- Mirrors the clear button Ionic puts inside its
                                                     searchbar: a muted icon in the field's trailing edge,
                                                     only while there is something to clear. It stays mounted
                                                     and is hidden with `visibility` rather than unmounted, so
                                                     its box keeps its place and the field does not reflow
                                                     when the icon comes and goes. -->
                                                <button
                                                    type="button"
                                                    slot="end"
                                                    class="game-answer__clear"
                                                    :class="{ 'game-answer__clear--hidden': !hasDraft(index) }"
                                                    :aria-label="`Clear your answer for word ${index + 1}`"
                                                    @pointerdown.prevent
                                                    @click="clearAnswer(index)"
                                                >
                                                    <font-awesome-icon :icon="clearIcon" aria-hidden="true" />
                                                </button>
                                            </ion-textarea>
                                            <ion-button
                                                class="game-answer__check"
                                                color="primary"
                                                :disabled="!hasDraft(index)"
                                                @click="submitAnswer(vocabulary, index)"
                                            >
                                                Check
                                            </ion-button>
                                        </template>
                                    </div>

                                    <div class="game-footer">
                                        <p
                                            class="game-feedback"
                                            :class="feedbackClass(vocabulary, index)"
                                            role="status"
                                        >
                                            <template v-if="vocabulary.isCorrect === true">
                                                <!-- The locked answer above already shows a tick and the
                                                     word, so this would be saying it twice. Kept for
                                                     assistive tech, which cannot see the tick (WCAG 4.1.3). -->
                                                <span class="visually-hidden">Correct!</span>
                                            </template>
                                            <template v-else-if="isRevealed(index)">
                                                <font-awesome-icon :icon="infoIcon" aria-hidden="true" />
                                                <span
                                                    >The word is <strong>{{ vocabulary.word }}</strong></span
                                                >
                                            </template>
                                            <template v-else-if="vocabulary.isCorrect === false">
                                                <font-awesome-icon :icon="incorrectIcon" aria-hidden="true" />
                                                <span>{{ failedMessage }}</span>
                                            </template>
                                        </p>

                                        <ion-button
                                            class="game-reveal"
                                            :class="{ 'game-reveal--hidden': !canReveal(vocabulary, index) }"
                                            fill="clear"
                                            size="small"
                                            color="primary"
                                            @click="reveal(index)"
                                        >
                                            Show the answer
                                        </ion-button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Purely decorative: the outcome is already announced by the icon, the
                             feedback line and the sound. Re-mounted through `answerFeedbackKey`
                             so every submission replays it from the first frame. -->
                        <div v-if="hasAnswerFeedback" class="answer-feedback">
                            <lottie-animation
                                :key="answerFeedbackKey"
                                class="answer-feedback__animation"
                                :animation-data="answerFeedbackAnimation"
                                :primary-color-variable="
                                    isAnswerCorrect ? '--ion-color-primary' : '--ion-color-warning'
                                "
                                :accent-color-variable="
                                    isAnswerCorrect ? '--ion-color-primary-tint' : '--ion-color-warning-tint'
                                "
                                :loop="true"
                            />
                        </div>
                    </div>

                    <nav class="game-rail" aria-label="Words in this game">
                        <button
                            v-for="(vocabulary, index) of vocabularies"
                            :key="index"
                            type="button"
                            class="game-rail__step"
                            :class="railClass(vocabulary, index)"
                            :aria-current="index === activeIndex ? 'step' : undefined"
                            :aria-label="`Word ${index + 1}: ${railStateLabel(vocabulary, index)}`"
                            @click="goToSlide(index)"
                        />
                    </nav>
                </div>

                <div v-if="isLoading" class="game-loading">
                    <spinner inline-style="height: auto" />
                    <ion-card-subtitle class="ion-text-center" role="status">
                        Preparing the guessing game for today ...
                    </ion-card-subtitle>
                </div>

                <div v-else-if="!vocabularies.length" class="game-empty">
                    <lottie-animation class="game-empty__art" :animation-data="funGameAnimation" :loop="true">
                        <template #fallback>
                            <fun-icon
                                :fill-color-variable="'--ion-color-primary'"
                                :stroke-color-variable="'--ion-color-primary'"
                            />
                        </template>
                    </lottie-animation>
                    <h2 class="game-empty__title">Nothing to guess yet</h2>
                    <p class="game-empty__text">
                        Add a few words to your dictionary and a fresh guessing game will be waiting for you here.
                    </p>
                    <ion-button color="primary" @click="goToAddVocabulary">
                        <font-awesome-icon :icon="plusIcon" class="ion-padding-end" aria-hidden="true" />
                        Add a word
                    </ion-button>
                </div>

                <ion-modal
                    :is-open="isInfoModalOpened"
                    :initial-breakpoint="0.4"
                    :breakpoints="[0, 0.4, 0.7, 0.9]"
                    @willDismiss="isInfoModalOpened = false"
                >
                    <div class="info-sheet">
                        <h2 class="info-sheet__title">How the daily game works</h2>
                        <ul class="info-sheet__list">
                            <li>You are given a set of meanings. Type the word that matches each one.</li>
                            <li>Every correct guess adds to your score for the day.</li>
                            <li>Guess them all and you unlock another round today.</li>
                            <li>A brand new set is ready for you the next day.</li>
                        </ul>
                        <ion-button color="primary" expand="block" @click="isInfoModalOpened = false"
                            >Got it</ion-button
                        >
                    </div>
                </ion-modal>

                <ion-modal
                    :is-open="isCompletionModalOpened"
                    :initial-breakpoint="0.6"
                    :breakpoints="[0, 0.6, 0.85, 1]"
                    @willDismiss="isCompletionModalOpened = false"
                >
                    <div class="completion-content">
                        <lottie-animation
                            class="completion-animation"
                            :animation-data="gameCompleteAnimation"
                            :loop="true"
                        >
                            <template #fallback>
                                <fun-icon
                                    :fill-color-variable="'--ion-color-primary'"
                                    :stroke-color-variable="'--ion-color-primary'"
                                />
                            </template>
                        </lottie-animation>
                        <h2 class="completion-title">All words guessed!</h2>
                        <p class="completion-text">Well done, you nailed every word in today's round.</p>
                        <ion-chip class="completion-stat">
                            <span class="completion-stat__value">{{ correctAnswerCount }}</span>
                            <span>of {{ vocabularies.length }} correct</span>
                        </ion-chip>
                        <ion-button color="primary" expand="block" @click="isCompletionModalOpened = false">
                            Close
                        </ion-button>
                    </div>
                </ion-modal>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonTextarea, IonButton, IonCardSubtitle, IonChip, IonModal } from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import Spinner from '@/views/shared/Spinner.vue';
import LottieAnimation from '@/media/LottieAnimation.vue';
import FunIcon from '@/media/FunIcon.vue';
import answerCorrect from '@/media/lottie/answer-correct.json';
import answerIncorrect from '@/media/lottie/answer-incorrect.json';
import gameComplete from '@/media/lottie/game-complete.json';
import funGame from '@/media/lottie/fun-game.json';
import type { LottieAnimationData } from '@/media/lottie/types';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import MessageDB from '@/utils/MessageDB';
import { RandomlyChosenMeaningResponse } from '@/domains/RandomlyChosenMeaningResponse';
import { format } from 'date-fns';
import NativeStorage from '@/utils/NativeStorage';
import Route from '@/domains/Route';
import Swiper from 'swiper';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faCircleCheck,
    faPlus,
    faInfoCircle,
    faTimesCircle,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { cloneDeep } from 'lodash';

type SlideVisualState = 'is-correct' | 'is-revealed' | 'is-incorrect' | 'is-neutral';

export default defineComponent({
    name: 'GuessingGame',
    components: {
        FirecrackerHeader,
        Spinner,
        IonPage,
        IonContent,
        IonTextarea,
        IonCardSubtitle,
        IonChip,
        LottieAnimation,
        FunIcon,
        IonButton,
        FontAwesomeIcon,
        IonModal,
    },
    data() {
        return {
            correctIcon: faCircleCheck,
            incorrectIcon: faTriangleExclamation,
            infoIcon: faInfoCircle,
            clearIcon: faTimesCircle,
            plusIcon: faPlus,
            correctAnimation: answerCorrect,
            incorrectAnimation: answerIncorrect,
            gameCompleteAnimation: gameComplete,
            funGameAnimation: funGame,
            failedMessage: 'Not quite. Try again.',
            isLoading: true,
            vocabularies: [] as RandomlyChosenMeaningResponse[],
            // Draft per word so a half-typed answer survives swiping away and back.
            givenAnswers: [] as string[],
            // The word whose answer is on screen, if any.
            revealedIndex: null as number | null,
            correctAnswerCount: 0,
            activeIndex: 0,
            scorePulseKey: 0,
            swiper: null as Swiper | null,
            isInfoModalOpened: false,
            isCompletionModalOpened: false,
            hasAnswerFeedback: false,
            answerFeedbackKey: 0,
            isAnswerCorrect: true,
            // Only read while `hasAnswerFeedback` is true, i.e. after the first answer.
            answerFeedbackAnimation: answerCorrect as LottieAnimationData,
        };
    },
    computed: {
        showGame(): boolean {
            return !this.isLoading && this.vocabularies.length > 0;
        },
        answeredCount(): number {
            return this.vocabularies.filter((vocabulary) => typeof vocabulary.isCorrect === 'boolean').length;
        },
        progressPercent(): number {
            return this.vocabularies.length ? Math.round((this.answeredCount / this.vocabularies.length) * 100) : 0;
        },
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clean();
        this.swiper?.disable();
        this.swiper?.destroy();
    },
    methods: {
        async init(): Promise<void> {
            this.initSwiper();
            await this.assertLoadingVocabularies();
            this.swiper?.init();
        },

        initSwiper(): void {
            this.swiper = new Swiper('.swiper', {
                init: false,
                // Swiping past the last word wraps to the first (and back), so the
                // rail and the gesture agree: both can reach every word from
                // anywhere. `rewind` keeps the slides 1:1 with the words, unlike
                // `loop`, which clones them and would break `realIndexChange`.
                rewind: true,
                spaceBetween: 12,
            });

            this.swiper.on('realIndexChange', (swiper: Swiper) => {
                this.onSlideChange(swiper.activeIndex);
            });
        },

        /**
         * Moving to another word drops any answer the previous one was showing,
         * so coming back offers "Show the answer" again.
         */
        onSlideChange(index: number): void {
            this.activeIndex = index;
            this.revealedIndex = null;
        },

        async assertLoadingVocabularies(): Promise<void> {
            this.isLoading = true;
            const cachedRandomlyChosenMeaningResponse = await NativeStorage.getGuessingGameVocabularies();
            const today = format(new Date(), 'yyyy-MM-dd');
            if (cachedRandomlyChosenMeaningResponse?.createdAt !== today) {
                NativeStorage.removeGuessingGameVocabularies().catch();
                await this.loadVocabularies();
            } else {
                this.setVocabularies(cachedRandomlyChosenMeaningResponse.data);
            }
            this.isLoading = false;
        },

        async loadVocabularies(): Promise<void> {
            try {
                const vocabularies = await HttpHandler.get<RandomlyChosenMeaningResponse[]>(
                    `/v1/vocabularies/definitions/random-search`,
                );
                this.setVocabularies(vocabularies);
                this.storeInCache(vocabularies);
            } catch {
                this.setVocabularies([]);
                await Toast.present(MessageDB.genericError, 'error');
            }
        },

        setVocabularies(vocabularies: RandomlyChosenMeaningResponse[]): void {
            this.vocabularies = vocabularies ?? [];
            // Revisiting an already-guessed word keeps its answer locked in.
            this.givenAnswers = this.vocabularies.map((vocabulary) => (vocabulary.isCorrect ? vocabulary.word : ''));
            this.revealedIndex = null;
            this.activeIndex = 0;
            this.calculateCorrectAnswerCount();
        },

        submitAnswer(vocabulary: RandomlyChosenMeaningResponse, index: number): void {
            const given = this.givenAnswers[index]?.trim().toLowerCase();

            // The Check button is disabled without a draft; guard the keyboard path too.
            if (!given) {
                return;
            }

            const previousCorrectAnswerCount = this.correctAnswerCount;
            const isCorrect = given === vocabulary.word.trim().toLowerCase();

            this.vocabularies[index].isCorrect = isCorrect;
            this.playSound(isCorrect ? 'correct' : 'wrong');
            this.calculateCorrectAnswerCount();

            if (this.correctAnswerCount !== previousCorrectAnswerCount) {
                this.scorePulseKey += 1;
            }

            if (this.correctAnswerCount === this.vocabularies.length) {
                NativeStorage.removeGuessingGameVocabularies().catch();
                // The last correct guess is celebrated by the completion modal, so
                // the per-answer burst is retired instead of being left mounted.
                this.hasAnswerFeedback = false;
                this.isCompletionModalOpened = true;
            } else {
                this.storeInCache(cloneDeep(this.vocabularies));
                this.playAnswerFeedback(isCorrect);
            }
        },

        playAnswerFeedback(isCorrect: boolean): void {
            this.isAnswerCorrect = isCorrect;
            this.answerFeedbackAnimation = isCorrect ? this.correctAnimation : this.incorrectAnimation;
            this.hasAnswerFeedback = true;
            this.answerFeedbackKey += 1;
        },

        calculateCorrectAnswerCount(): void {
            this.correctAnswerCount = this.vocabularies.reduce((accumulator, currentValue) => {
                return currentValue.isCorrect ? accumulator + 1 : accumulator;
            }, 0);
        },

        onGivingAnswer(givenAnswer: string, index: number): void {
            this.givenAnswers[index] = givenAnswer;
        },

        hasDraft(index: number): boolean {
            return Boolean(this.givenAnswers[index]?.trim());
        },

        /**
         * Clears the word in one go. The field is bound to `givenAnswers`, and
         * `ion-textarea` writes a changed value straight to its native textarea, so
         * emptying the draft is enough to empty the field.
         *
         * The browser blurs the field as soon as another element is pressed, for a
         * touch as much as a mouse, and preventing `pointerdown` only stops the
         * button taking focus — it does not stop that blur. So the caret is put back
         * explicitly: the reason to clear is to type the word again.
         */
        clearAnswer(index: number): void {
            this.givenAnswers[index] = '';
            this.$nextTick(() => {
                const fields = (this.$el as HTMLElement).querySelectorAll<HTMLElement & { setFocus?: () => void }>(
                    '.game-answer__field',
                );
                fields[index]?.setFocus?.();
            });
        },

        reveal(index: number): void {
            this.revealedIndex = index;
        },

        isRevealed(index: number): boolean {
            return this.revealedIndex === index;
        },

        canReveal(vocabulary: RandomlyChosenMeaningResponse, index: number): boolean {
            return vocabulary.isCorrect !== true && !this.isRevealed(index);
        },

        feedbackClass(vocabulary: RandomlyChosenMeaningResponse, index: number): SlideVisualState {
            if (vocabulary.isCorrect === true) {
                return 'is-correct';
            }

            if (this.isRevealed(index)) {
                return 'is-revealed';
            }

            if (vocabulary.isCorrect === false) {
                return 'is-incorrect';
            }

            return 'is-neutral';
        },

        railClass(vocabulary: RandomlyChosenMeaningResponse, index: number): Record<string, boolean> {
            return {
                'is-correct': vocabulary.isCorrect === true,
                'is-incorrect': vocabulary.isCorrect === false,
                'is-current': index === this.activeIndex,
            };
        },

        railStateLabel(vocabulary: RandomlyChosenMeaningResponse, index: number): string {
            if (vocabulary.isCorrect === true) {
                return 'answered correctly';
            }

            if (vocabulary.isCorrect === false) {
                return this.isRevealed(index) ? 'answered incorrectly, answer shown' : 'answered incorrectly';
            }

            return index === this.activeIndex ? 'current word, not answered yet' : 'not answered yet';
        },

        goToSlide(index: number): void {
            this.swiper?.slideTo(index);
        },

        goToAddVocabulary(): void {
            this.$router.push({ name: Route.AddVocabulary });
        },

        playSound(type: 'correct' | 'wrong'): void {
            try {
                let sound: HTMLAudioElement;
                if (type === 'correct') {
                    sound = new Audio('/assets/audio-clips/correct-answer.mp3');
                } else {
                    sound = new Audio('/assets/audio-clips/wrong-answer.mp3');
                }
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
            if (vocabularies.length) {
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
            this.givenAnswers = [];
            this.revealedIndex = null;
            this.correctAnswerCount = 0;
            this.activeIndex = 0;
            this.scorePulseKey = 0;
            this.hasAnswerFeedback = false;
            this.answerFeedbackKey = 0;
            this.isCompletionModalOpened = false;
            this.isInfoModalOpened = false;
        },
    },
});
</script>

<style scoped>
ion-content#guessing-game {
    --padding-top: var(--space-md);
    --padding-bottom: var(--space-md);
}

.game-shell {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    width: 100%;
    /* Comfortable reading measure, matching the app's centred content column. */
    max-width: 640px;
    min-height: 100%;
    margin: 0 auto;
    padding: 0 var(--space-md);
}

/* ---------------------------------------------------------------- progress */

.game-progress {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex: 0 0 auto;
}

.game-progress__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
}

.game-progress__label {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--ion-text-color-step-300);
}

.game-progress__label strong {
    font-weight: var(--font-weight-bold);
    color: var(--ion-color-primary);
}

.game-score {
    --color: var(--ion-color-primary);
    flex: 0 0 auto;
    margin: 0;
}

.game-score__icon,
.game-score__value {
    margin-inline-end: var(--space-2xs);
}

.game-score__value {
    display: inline-block;
    font-weight: var(--font-weight-bold);
    /* The keyed span replays this so a successful guess registers. */
    animation: score-pop var(--duration-slow) var(--ease-emphasized);
}

@keyframes score-pop {
    0% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}

.game-progress__track {
    /* Both bars on this screen (progress and rail) share one height. */
    height: 8px;
    border-radius: var(--radius-pill);
    /* Same pending colour as an unanswered rail segment. */
    background: var(--ion-color-lightest);
    overflow: hidden;
}

.game-progress__fill {
    height: 100%;
    border-radius: inherit;
    background: var(--ion-color-primary);
    transition: width var(--duration-slow) var(--ease-emphasized);
}

.game-hint {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2xs);
    font-size: var(--text-sm);
    color: var(--ion-text-color-step-300);
}

.game-hint__link {
    margin: 0;
    font-weight: var(--font-weight-semibold);
}

/* ------------------------------------------------------------------- stage */

.game-stage {
    display: flex;
    flex-direction: column;
    /* Centres the card and the rail together, so a tall screen gets balanced
       margins instead of one giant empty card. */
    justify-content: center;
    gap: var(--space-sm);
    flex: 1 1 auto;
    min-height: 0;
}

.game-viewport {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    /* Keeps the card a focused size on tall screens instead of one giant box. */
    min-height: 320px;
    max-height: 560px;
}

.swiper {
    flex: 1 1 auto;
    border-radius: var(--radius-lg);
}

.swiper-slide {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    box-sizing: border-box;
    padding: var(--space-lg) var(--space-md);
    background: var(--ion-card-background);
    border: 1px solid var(--app-border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.game-card__body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-xs);
    /* The label and the meaning travel together, centred in the card, so a long
       definition and a one-liner both look deliberate. */
    flex: 1 1 auto;
    min-height: 0;
}

.game-card__eyebrow {
    margin: 0;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--ion-color-primary);
}

.game-card__prompt {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: var(--font-weight-medium);
    line-height: var(--leading-snug);
}

.game-answer {
    display: flex;
    /* Centred, not stretched: an `ion-button` uses the app's standard 36px
       height, so it should not be blown up to the height of the field. */
    align-items: center;
    gap: var(--space-xs);
    flex: 0 0 auto;
}

/* Uses the app-wide `ion-textarea` styling (border, background and focus ring
   from `src/styles/ionic.css`) so the answer field matches the vocabulary
   screens instead of re-inventing them here.
   Ionic renders its md "highlight" bar on a bare `ion-textarea` but skips it
   for fields inside an `ion-item` (which is why the vocabulary fields never
   show one). The app already draws a focus ring, so the bar is redundant. */
.game-answer__field {
    flex: 1 1 auto;
    min-width: 0;
    --highlight-height: 0;
    /* Ionic reserves 18px above and 8px below for a floating label that this
       field never renders, which leaves a single line sitting below centre.
       One value for both keeps the placeholder centred; the control still
       grows evenly because auto-grow sizes it from its own content. */
    --padding-top: var(--space-xs);
    --padding-bottom: var(--space-xs);
    /* Ionic's 44px minimum would leave the single line sitting at the top of an
       otherwise empty box; the field is one line tall plus its own padding. */
    min-height: 0;
}

/* The clear button Ionic puts inside its searchbar, reproduced for this field.
   It lives in the textarea's `end` slot, so it sits inside the field's border
   rather than beside it. */
.game-answer__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    /* 32px on its own clears the WCAG 2.2 target size minimum (24x24). */
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--ion-text-color-step-400);
    font-size: var(--icon-md);
    line-height: 1;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-standard);
}

.game-answer__clear:hover,
.game-answer__clear:focus-visible {
    color: var(--ion-color-primary);
}

/* Hidden rather than unmounted, so the 32px stays reserved and the field does not
   reflow when the icon appears. `visibility` also keeps it out of the tab order and
   out of the accessibility tree while it is hidden. */
.game-answer__clear--hidden {
    visibility: hidden;
    pointer-events: none;
}

.game-answer__check {
    margin: 0;
}

/* Locks in a word that was already answered correctly. */
.game-locked {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    width: 100%;
    margin: 0;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    background: var(--ion-color-lightest);
    color: var(--ion-color-lightest-contrast);
    font-weight: var(--font-weight-semibold);
}

.game-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    /* Reserved so feedback never shifts the card. */
    min-height: 1.5rem;
    flex: 0 0 auto;
}

.game-feedback {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin: 0;
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
}

.game-feedback.is-correct {
    color: var(--ion-color-primary);
}

.game-feedback.is-revealed {
    color: var(--ion-text-color);
}

.game-feedback.is-revealed strong {
    color: var(--ion-color-primary);
}

.game-feedback.is-incorrect {
    color: var(--ion-color-warning);
}

.game-feedback.is-neutral {
    color: var(--ion-text-color-step-300);
}

/* Announce-only: visible to assistive tech, not to the eye. */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
}

.game-reveal {
    flex: 0 0 auto;
    margin: 0;
}

/* Keeps its space once the answer is revealed, so the feedback never shifts. */
.game-reveal--hidden {
    visibility: hidden;
}

/* The burst is decorative and must never block the input underneath. It sits in
   the free space above the prompt so it never covers the meaning. */
.answer-feedback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: var(--space-md);
    z-index: 2;
    pointer-events: none;
}

.answer-feedback__animation {
    width: clamp(6rem, 38%, 10rem);
}

/* -------------------------------------------------------------------- rail */

.game-rail {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
    flex: 0 0 auto;
}

.game-rail__step {
    position: relative;
    flex: 1 1 0;
    /* Same bar height as the progress track above. */
    height: 8px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-pill);
    background: var(--ion-color-lightest);
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-standard),
        transform var(--duration-fast) var(--ease-standard);
}

/* A 32px-tall hit area around an 8px bar, which clears the WCAG 2.2 target
   size minimum (24x24) without changing the visual weight. */
.game-rail__step::after {
    content: '';
    position: absolute;
    inset: -12px 0;
}

.game-rail__step.is-current {
    transform: scaleY(1.5);
}

.game-rail__step.is-current:not(.is-correct):not(.is-incorrect) {
    background: var(--ion-color-primary-tint);
}

.game-rail__step.is-correct {
    background: var(--ion-color-primary);
}

.game-rail__step.is-incorrect {
    background: var(--ion-color-warning);
}

/* ------------------------------------------------------- loading / empty */

.game-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    flex: 1 1 auto;
}

.game-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    flex: 1 1 auto;
    justify-content: center;
    padding: var(--space-xl) var(--space-md);
    text-align: center;
}

.game-empty__art {
    width: clamp(9rem, 62%, 14rem);
}

.game-empty__title {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: var(--font-weight-bold);
}

.game-empty__text {
    max-width: 40ch;
    margin: 0;
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
    color: var(--ion-text-color-step-300);
}

/* ------------------------------------------------------------------ modals */

.info-sheet,
.completion-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-md) var(--space-xl);
}

.info-sheet__title,
.completion-title {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: var(--font-weight-bold);
}

.info-sheet__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: 0;
    padding: 0;
    list-style: none;
}

.info-sheet__list li {
    position: relative;
    padding-left: var(--space-lg);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
    color: var(--ion-text-color-step-300);
}

.info-sheet__list li::before {
    content: '';
    position: absolute;
    top: 0.45em;
    left: 0;
    width: var(--space-xs);
    height: var(--space-xs);
    border-radius: var(--radius-pill);
    background: var(--ion-color-primary);
}

.completion-content {
    align-items: center;
    text-align: center;
}

.completion-animation {
    width: clamp(8rem, 55%, 12rem);
}

.completion-text {
    max-width: 40ch;
    margin: 0;
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
    color: var(--ion-text-color-step-300);
}

.completion-stat {
    --color: var(--ion-color-primary);
    margin: 0;
}

.completion-stat__value {
    margin-inline-end: var(--space-2xs);
    font-size: var(--text-lg);
    font-weight: var(--font-weight-bold);
}

@media (prefers-reduced-motion: reduce) {
    .game-progress__fill,
    .game-rail__step {
        transition: none;
    }

    .game-score__value {
        animation: none;
    }
}
</style>
