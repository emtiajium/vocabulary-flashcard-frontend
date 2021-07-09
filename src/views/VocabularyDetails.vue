<template>
    <ion-page>
        <firecracker-header
            :header-title="$route.params.word || ''"
            content-id="vocabulary-details"
            menu-id="vocabulary-details-menu"
        />

        <ion-content :fullscreen="true" id="vocabulary-details">
            <spinner v-if="isLoading" />

            <view v-if="!isLoading && Object.keys(vocabulary).length">
                <empty-container v-if="showDefaultMessage" :message="defaultMessage" />

                <view v-for="(definition, definitionIndex) in vocabulary.definitions" :key="definition.id">
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>
                                <span>
                                    {{ definitionIndex === 0 ? 'Meaning of' : 'Another Meaning of' }}
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
                                <view v-for="(example, exampleIndex) in definition.examples" :key="exampleIndex">
                                    <li>
                                        <span class="capitalize"> {{ example }} </span>
                                        <br />
                                        <br />
                                    </li>
                                </view>
                            </ul>

                            <view v-if="definition.notes.length">
                                <ion-card-title> Notes </ion-card-title>
                                <ul>
                                    <view v-for="(note, noteIndex) in definition.notes" :key="noteIndex">
                                        <li>
                                            <span class="capitalize"> {{ note }} </span>
                                            <br />
                                            <br />
                                        </li>
                                    </view>
                                </ul>
                            </view>

                            <view v-if="definition.externalLinks.length">
                                <ion-card-header> External Links </ion-card-header>
                                <ul>
                                    <view
                                        v-for="(externalLink, externalLinkIndex) in definition.externalLinks"
                                        :key="externalLinkIndex"
                                    >
                                        <li>
                                            <a :href="externalLink" target="_blank">
                                                <span>
                                                    Browse the link
                                                    <font-awesome-icon :icon="faExternalLinkAlt" />
                                                </span>
                                            </a>
                                            <br />
                                            <br />
                                        </li>
                                    </view>
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
                        <ul>
                            <view
                                v-for="(linkerWord, linkerWordIndex) in vocabulary.linkerWords"
                                :key="linkerWordIndex"
                            >
                                <li>
                                    <span class="capitalize">{{ linkerWord }}</span>
                                    <br />
                                    <br />
                                </li>
                            </view>
                        </ul>
                    </ion-card-content>
                </ion-card>

                <ion-card v-if="vocabulary.genericNotes.length">
                    <ion-card-header>
                        <ion-card-title> Generic Notes </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ul>
                            <view
                                v-for="(genericNote, genericNotesIndex) in vocabulary.genericNotes"
                                :key="genericNotesIndex"
                            >
                                <li>
                                    <span class="capitalize">{{ genericNote }}</span>
                                    <br />
                                    <br />
                                </li>
                            </view>
                        </ul>
                    </ion-card-content>
                </ion-card>

                <ion-card v-if="vocabulary.genericExternalLinks.length">
                    <ion-card-header>
                        <ion-card-title> Generic External Links </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ul>
                            <view
                                v-for="(
                                    genericExternalLink, genericExternalLinkIndex
                                ) in vocabulary.genericExternalLinks"
                                :key="genericExternalLinkIndex"
                            >
                                <li>
                                    <a :href="genericExternalLink" target="_blank">
                                        <span>
                                            Browse the link
                                            <font-awesome-icon :icon="faExternalLinkAlt" />
                                        </span>
                                    </a>
                                    <br />
                                    <br />
                                </li>
                            </view>
                        </ul>
                    </ion-card-content>
                </ion-card>
            </view>

            <dictionary v-if="!isLoading && Object.keys(vocabulary).length" :word="vocabulary.word" />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/vue';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import { useRoute } from 'vue-router';
import Spinner from '@/views/Spinner.vue';
import EmptyContainer from '@/views/EmptyContainer.vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import Dictionary from '@/views/Dictionary.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Toast from '@/utils/Toast';
import MessageDB from '@/utils/MessageDB';

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
    },
    data() {
        return {
            isLoading: true,
            vocabulary: {} as Vocabulary,
            showDefaultMessage: false,
            defaultMessage: `Looks like you haven't added anything yet!`,
            faExternalLinkAlt,
        };
    },
    async mounted() {
        try {
            this.vocabulary = await HttpHandler.get<Vocabulary>(`/v1/vocabularies/${useRoute().params.id}`);
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
    beforeUnmount() {
        this.showDefaultMessage = false;
        this.vocabulary = {} as Vocabulary;
    },
});
</script>

<style scoped></style>
