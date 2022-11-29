<template>
    <ion-page>
        <firecracker-header
            :header-title="headerTitle"
            content-id="vocabulary-details"
            menu-id="vocabulary-details-menu"
            type="BACK"
        />

        <ion-content :fullscreen="true" id="vocabulary-details">
            <spinner v-if="isLoading" />

            <ion-row
                v-if="!isLoading && Object.keys(vocabulary).length"
                class="display-flex ion-justify-content-center"
            >
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="10" sizeXl="10">
                    <ion-card v-if="showDefaultMessage" class="ion-padding margin-top-unset">
                        <empty-container :message="defaultMessage" />
                    </ion-card>

                    <view v-for="(definition, definitionIndex) in vocabulary.definitions" :key="definition.id">
                        <ion-card :class="definitionIndex === 0 ? 'margin-top-unset' : ''">
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

                    <ion-card
                        v-if="vocabulary.linkerWords.length"
                        :class="vocabulary.definitions.length === 0 ? 'margin-top-unset' : ''"
                    >
                        <ion-card-header>
                            <ion-card-title> Relatable Words </ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <view
                                v-for="(linkerWord, linkerWordIndex) in vocabulary.linkerWords"
                                :key="linkerWordIndex"
                            >
                                <ion-button color="card" mode="ios" @click="$router.push(`/dictionary/${linkerWord}`)">
                                    <ion-chip class="linker-word-chip">
                                        <span class="ion-padding-end overflowed-content">
                                            {{ linkerWord }}
                                        </span>
                                        <font-awesome-icon
                                            :icon="faExternalLinkAlt"
                                            class="firecracker-primary-color-icon"
                                        />
                                    </ion-chip>
                                </ion-button>
                            </view>
                        </ion-card-content>
                    </ion-card>

                    <ion-card
                        v-if="vocabulary.genericNotes.length"
                        :class="vocabulary.linkerWords.length === 0 ? 'margin-top-unset' : ''"
                    >
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

                    <ion-card
                        v-if="vocabulary.genericExternalLinks.length"
                        :class="vocabulary.genericNotes.length === 0 ? 'margin-top-unset' : ''"
                    >
                        <ion-card-header>
                            <ion-card-title> Generic External Links </ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ul>
                                <li
                                    v-for="(
                                        genericExternalLink, genericExternalLinkIndex
                                    ) in vocabulary.genericExternalLinks"
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
                        :icon="vocabulary.isInLeitnerBox ? faHeartSolid : faHeartRegular"
                        class="firecracker-primary-color-icon leitner-icon"
                    />
                </ion-fab-button>
                <span class="ion-margin-top" />
                <ion-fab-button
                    size="small"
                    color="warning"
                    @click="$router.push(`/vocabulary/update/${vocabulary.id}`)"
                >
                    <font-awesome-icon :icon="faPencilAlt" />
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
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonFab,
    IonFabButton,
    IonButton,
    IonChip,
    IonRow,
    IonCol,
} from '@ionic/vue';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import Spinner from '@/views/Spinner.vue';
import EmptyContainer from '@/views/EmptyContainer.vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import Dictionary from '@/views/Dictionary.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faExternalLinkAlt, faPencilAlt, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import Toast from '@/utils/Toast';
import MessageDB from '@/utils/MessageDB';
import LeitnerSystemService from '@/utils/LeitnerSystemService';

export default defineComponent({
    name: 'VocabularyDetails',
    components: {
        Dictionary,
        FirecrackerHeader,
        Spinner,
        EmptyContainer,
        IonPage,
        IonContent,
        IonCard,
        IonCardContent,
        FontAwesomeIcon,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonFab,
        IonFabButton,
        IonButton,
        IonChip,
        IonRow,
        IonCol,
    },
    data() {
        return {
            headerTitle: this.$route.params.word || '',
            disableInsertingIntoLeitnerBox: this.$route.params.disableInsertingIntoLeitnerBox === 'true',
            isLoading: true,
            vocabulary: {} as Vocabulary,
            showDefaultMessage: false,
            defaultMessage: `Looks like you haven't added anything yet!`,
            faExternalLinkAlt,
            faPencilAlt,
            faHeartSolid,
            faHeartRegular,
            disableBoxInsertionButton: false,
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
            await this.loadVocabulary();
        },
        async loadVocabulary(): Promise<void> {
            try {
                this.vocabulary = await HttpHandler.get<Vocabulary>(`/v1/vocabularies/${this.$route.params.id}`);
                this.headerTitle = this.vocabulary.word;
                if (
                    !this.vocabulary.definitions?.length &&
                    !this.vocabulary.linkerWords?.length &&
                    !this.vocabulary.genericNotes?.length &&
                    !this.vocabulary.genericExternalLinks?.length
                ) {
                    this.showDefaultMessage = true;
                }
            } catch {
                await Promise.all([Toast.present(MessageDB.networkError), this.$router.back()]);
            } finally {
                this.isLoading = false;
            }
        },
        async insertIntoLeitnerBox(): Promise<void> {
            this.disableBoxInsertionButton = true;
            await LeitnerSystemService.insertIntoLeitnerBox(`${this.$route.params.id}`);
            this.disableBoxInsertionButton = false;
            this.vocabulary.isInLeitnerBox = true;
        },
        clean(): void {
            this.isLoading = true;
            this.vocabulary = {} as Vocabulary;
            this.showDefaultMessage = false;
        },
    },
});
</script>

<style scoped>
.linker-word-chip {
    max-width: 20em;
}
li {
    padding-bottom: 10px;
}
.leitner-icon {
    font-size: 20px;
}
</style>
