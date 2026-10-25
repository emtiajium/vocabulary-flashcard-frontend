<template>
    <spinner v-if="isLoading" />

    <ion-row v-if="!isLoading && Object.keys(vocabulary).length" class="display-flex ion-justify-content-center">
        <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
            <ion-card v-if="showDefaultMessage" class="ion-padding">
                <empty-container :message="defaultMessage" />
            </ion-card>

            <view v-for="definition in vocabulary.definitions" :key="definition.id">
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>
                            <span class="capitalize"> {{ definition.meaning }} </span>
                        </ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <ion-card-title> Examples </ion-card-title>
                        <ul class="examples-list">
                            <li v-for="(example, exampleIndex) in definition.examples" :key="exampleIndex">
                                <span class="capitalize"> {{ example }} </span>
                            </li>
                        </ul>

                        <view v-if="definition.notes?.length">
                            <ion-card-title> Notes </ion-card-title>
                            <ul class="notes-list">
                                <li v-for="(note, noteIndex) in definition.notes" :key="noteIndex">
                                    <span v-html="note" class="capitalize link-container image-container" />
                                </li>
                            </ul>
                        </view>

                        <view v-if="definition.externalLinks?.length">
                            <ion-card-title> External Links </ion-card-title>
                            <ul class="links-list">
                                <li
                                    v-for="(externalLink, externalLinkIndex) in definition.externalLinks"
                                    :key="externalLinkIndex"
                                >
                                    <a :href="externalLink" target="_blank">
                                        <span>
                                            Browse the link
                                            <font-awesome-icon :icon="faExternalLinkAlt" />
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </view>
                    </ion-card-content>
                </ion-card>
            </view>

            <ion-card v-if="vocabulary.linkerWords?.length">
                <ion-card-header>
                    <ion-card-title> Relatable Words </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <view v-for="(linkerWord, linkerWordIndex) in vocabulary.linkerWords" :key="linkerWordIndex">
                        <ion-chip class="linker-word-chip" @click="$router.push(`/linker-words/${linkerWord}`)">
                            <span class="ion-padding-end overflowed-content">
                                {{ linkerWord }}
                            </span>
                            <font-awesome-icon :icon="faExternalLinkAlt" class="firecracker-primary-color-icon" />
                        </ion-chip>
                    </view>
                </ion-card-content>
            </ion-card>

            <ion-card v-if="vocabulary.genericNotes?.length">
                <ion-card-header>
                    <ion-card-title> Generic Notes </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ul class="notes-list">
                        <li
                            v-for="(genericNote, genericNotesIndex) in vocabulary.genericNotes"
                            :key="genericNotesIndex"
                        >
                            <span v-html="genericNote" class="capitalize link-container image-container" />
                        </li>
                    </ul>
                </ion-card-content>
            </ion-card>

            <ion-card v-if="vocabulary.genericExternalLinks?.length">
                <ion-card-header>
                    <ion-card-title> Generic External Links </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ul class="links-list">
                        <li
                            v-for="(genericExternalLink, genericExternalLinkIndex) in vocabulary.genericExternalLinks"
                            :key="genericExternalLinkIndex"
                        >
                            <a :href="genericExternalLink" target="_blank">
                                <span>
                                    Browse the link
                                    <font-awesome-icon
                                        :icon="faExternalLinkAlt"
                                        class="firecracker-primary-color-icon"
                                    />
                                </span>
                            </a>
                        </li>
                    </ul>
                </ion-card-content>
            </ion-card>

            <dictionary
                v-if="!isLoading && Object.keys(vocabulary).length"
                :word="vocabulary.word"
                :label-alignment="'left'"
            />
        </ion-col>
    </ion-row>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button
            v-if="!isLoading && Object.keys(vocabulary).length && !disableInsertingIntoLeitnerBox"
            aria-label="Make flashcard"
            size="small"
            color="lightest"
            :disabled="disableBoxInsertionButton"
            @click="insertIntoLeitnerBox"
        >
            <font-awesome-icon
                :icon="isInLeitnerBox ? faHeartSolid : faHeartRegular"
                class="firecracker-primary-color-icon leitner-icon"
            />
        </ion-fab-button>
        <span class="ion-margin-top" />
        <ion-fab-button
            aria-label="Edit"
            size="small"
            color="warning"
            @click="$router.push(`/vocabulary/update/${vocabulary.id}`)"
        >
            <font-awesome-icon :icon="faPencilAlt" />
        </ion-fab-button>
    </ion-fab>

    <!-- Teleported to the body because `ion-content` carries a transform, which
         would otherwise become the containing block and displace the burst.
         The position is therefore in document coordinates. -->
    <teleport to="body">
        <div v-if="flashcardFeedback" class="flashcard-feedback" :style="flashcardFeedbackStyle">
            <lottie-animation
                :key="flashcardFeedbackKey"
                class="flashcard-feedback__animation"
                :animation-data="flashcardCreatedAnimation"
                :loop="false"
                @complete="onFlashcardFeedbackComplete"
            />
        </div>
    </teleport>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonChip,
    IonRow,
    IonCol,
} from '@ionic/vue';
import Spinner from '@/views/shared/Spinner.vue';
import EmptyContainer from '@/views/vocab-read/EmptyContainer.vue';
import Dictionary from '@/views/vocab-read/Dictionary.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faExternalLinkAlt, faPencilAlt, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import LeitnerSystemService from '@/utils/LeitnerSystemService';
import Vocabulary from '@/domains/Vocabulary';
import LottieAnimation from '@/media/LottieAnimation.vue';
import flashcardCreated from '@/media/lottie/flashcard-created.json';

interface FlashcardFeedback {
    top: number;
    left: number;
}

export default defineComponent({
    name: 'VocabularyDetails',
    components: {
        Dictionary,
        Spinner,
        EmptyContainer,
        LottieAnimation,
        IonCard,
        IonCardContent,
        FontAwesomeIcon,
        IonCardHeader,
        IonCardTitle,
        IonFab,
        IonFabButton,
        IonChip,
        IonRow,
        IonCol,
    },
    props: {
        word: {
            type: String,
            required: true,
        },
        vocabulary: {
            type: Object as PropType<Vocabulary>,
            required: true,
        },
        disableInsertingIntoLeitnerBox: {
            type: Boolean,
            required: true,
        },
        isLoading: {
            type: Boolean,
            required: true,
        },
    },
    watch: {
        vocabulary(): void {
            this.onReceivingVocab();
        },
    },
    beforeUnmount(): void {
        this.clean();
    },
    data() {
        return {
            showDefaultMessage: false,
            defaultMessage: `Looks like you haven't added anything yet!`,
            faExternalLinkAlt,
            faPencilAlt,
            faHeartSolid,
            faHeartRegular,
            isInLeitnerBox: false,
            disableBoxInsertionButton: false,
            flashcardCreatedAnimation: flashcardCreated,
            flashcardFeedback: null as FlashcardFeedback | null,
            flashcardFeedbackKey: 0,
        };
    },
    computed: {
        flashcardFeedbackStyle(): Record<string, string> {
            if (!this.flashcardFeedback) {
                return {};
            }

            return { top: `${this.flashcardFeedback.top}px`, left: `${this.flashcardFeedback.left}px` };
        },
    },
    methods: {
        onReceivingVocab(): void {
            this.isInLeitnerBox = !!this.vocabulary.isInLeitnerBox;
            this.showDefaultMessage =
                !this.vocabulary.definitions?.length &&
                !this.vocabulary.linkerWords?.length &&
                !this.vocabulary.genericNotes?.length &&
                !this.vocabulary.genericExternalLinks?.length;
        },

        async insertIntoLeitnerBox(clickEvent: MouseEvent): Promise<void> {
            const target = clickEvent.currentTarget as HTMLElement | null;
            const origin = target ? this.centerOf(target) : null;

            this.disableBoxInsertionButton = true;
            const isCreated = await LeitnerSystemService.insertIntoLeitnerBox(`${this.vocabulary.id}`);
            this.disableBoxInsertionButton = false;

            if (!isCreated) {
                return;
            }

            this.isInLeitnerBox = true;

            if (origin) {
                this.playFlashcardFeedback(origin);
            }
        },

        centerOf(element: HTMLElement): FlashcardFeedback {
            const { top, left, width, height } = element.getBoundingClientRect();

            return {
                top: top + height / 2 + window.scrollY,
                left: left + width / 2 + window.scrollX,
            };
        },

        playFlashcardFeedback(origin: FlashcardFeedback): void {
            this.flashcardFeedback = origin;
            this.flashcardFeedbackKey += 1;
        },

        onFlashcardFeedbackComplete(): void {
            this.flashcardFeedback = null;
        },

        clean(): void {
            this.isInLeitnerBox = false;
            this.showDefaultMessage = false;
            this.flashcardFeedback = null;
        },
    },
});
</script>

<style scoped>
ion-card:first-of-type {
    margin-top: unset;
}
ion-card-content ion-card-title {
    font-size: var(--text-sm);
    color: var(--ion-color-primary);
    margin-top: var(--space-md);
    margin-bottom: var(--space-2xs);
    font-weight: var(--font-weight-semibold);
}
ion-card-content ion-card-title:first-child {
    margin-top: unset;
}
.linker-word-chip {
    max-width: 20rem;
}
/* Modern list styling (replaces default bullets / indentation) */
ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-sm);
}

.examples-list li,
.notes-list li {
    position: relative;
    padding-inline-start: calc(var(--space-md) + var(--space-2xs));
    line-height: 1.6;
}

.examples-list li::before,
.notes-list li::before {
    content: '';
    position: absolute;
    inset-inline-start: 0;
    top: 0.6em;
    width: 7px;
    height: 7px;
    border-radius: var(--radius-pill);
    background: var(--ion-color-primary);
}

/* Rich notes that embed media shouldn't get a marker or indent */
.notes-list li:has(img) {
    padding-inline-start: 0;
}
.notes-list li:has(img)::before {
    display: none;
}

/* External links render as tappable rows */
.links-list li a {
    display: flex;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--app-border-color);
    border-radius: var(--radius-md);
    background: var(--app-surface-raised);
    color: var(--ion-color-primary);
    font-weight: var(--font-weight-medium);
    transition: background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard);
}
.links-list li a span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    width: 100%;
}
.links-list li a:hover {
    border-color: transparent;
    background: var(--ion-color-lightest);
    color: var(--ion-color-lightest-contrast);
}
.leitner-icon {
    font-size: var(--icon-md);
}

.flashcard-feedback {
    position: absolute;
    z-index: 20;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.flashcard-feedback__animation {
    width: 88px;
}
</style>
