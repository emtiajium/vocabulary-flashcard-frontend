<template>
    <spinner v-if="isLoading" />

    <ion-row v-if="!isLoading && Object.keys(vocabulary).length" class="display-flex ion-justify-content-center">
        <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
            <ion-card v-if="showDefaultMessage" class="ion-padding">
                <empty-container :message="defaultMessage" />
            </ion-card>

            <view v-for="(definition, definitionIndex) in vocabulary.definitions" :key="definition.id">
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>
                            <span>
                                {{ definitionIndex === 0 ? 'Meaning of' : 'Another meaning of' }}
                                <strong> {{ vocabulary.word }} </strong>
                            </span>
                        </ion-card-title>
                        <ion-card-subtitle>
                            <span class="capitalize"> {{ definition.meaning }} </span>
                        </ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                        <ion-card-title> Examples </ion-card-title>
                        <ul>
                            <li v-for="(example, exampleIndex) in definition.examples" :key="exampleIndex">
                                <span class="capitalize"> {{ example }} </span>
                            </li>
                        </ul>

                        <view v-if="definition.notes.length">
                            <ion-card-title> Notes </ion-card-title>
                            <ul>
                                <li v-for="(note, noteIndex) in definition.notes" :key="noteIndex">
                                    <span v-html="note" class="capitalize link-container image-container" />
                                </li>
                            </ul>
                        </view>

                        <view v-if="definition.externalLinks.length">
                            <ion-card-title> External Links </ion-card-title>
                            <ul>
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

            <ion-card v-if="vocabulary.linkerWords.length">
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

            <ion-card v-if="vocabulary.genericNotes.length">
                <ion-card-header>
                    <ion-card-title> Generic Notes </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ul>
                        <li
                            v-for="(genericNote, genericNotesIndex) in vocabulary.genericNotes"
                            :key="genericNotesIndex"
                        >
                            <span v-html="genericNote" class="capitalize link-container image-container" />
                        </li>
                    </ul>
                </ion-card-content>
            </ion-card>

            <ion-card v-if="vocabulary.genericExternalLinks.length">
                <ion-card-header>
                    <ion-card-title> Generic External Links </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ul>
                        <li
                            v-for="(genericExternalLink, genericExternalLinkIndex) in vocabulary.genericExternalLinks"
                            :key="genericExternalLinkIndex"
                        >
                            <a :href="genericExternalLink" target="_blank">
                                <span>
                                    Browse the link
                                    <font-awesome-icon :icon="faExternalLinkAlt" />
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
        <ion-fab-button size="small" color="warning" @click="$router.push(`/vocabulary/update/${vocabulary.id}`)">
            <font-awesome-icon :icon="faPencilAlt" />
        </ion-fab-button>
    </ion-fab>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
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

export default defineComponent({
    name: 'VocabularyDetails',
    components: {
        Dictionary,
        Spinner,
        EmptyContainer,
        IonCard,
        IonCardContent,
        FontAwesomeIcon,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
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
        };
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

        async insertIntoLeitnerBox(): Promise<void> {
            this.disableBoxInsertionButton = true;
            await LeitnerSystemService.insertIntoLeitnerBox(`${this.vocabulary.id}`);
            this.disableBoxInsertionButton = false;
            this.isInLeitnerBox = true;
        },

        clean(): void {
            this.isInLeitnerBox = false;
            this.showDefaultMessage = false;
        },
    },
});
</script>

<style scoped>
ion-card:first-of-type {
    margin-top: unset;
}
.linker-word-chip {
    max-width: 20rem;
}
li {
    padding-bottom: var(--ion-padding);
}
li:last-of-type {
    padding-bottom: unset;
}
.leitner-icon {
    font-size: 20px;
}
</style>
