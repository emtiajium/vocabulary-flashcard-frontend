<template>
    <ion-page>
        <firecracker-header
            :header-title="$route.params.word || ''"
            content-id="vocabulary-details"
            menu-id="vocabulary-details-menu"
        />

        <ion-content :fullscreen="true" id="vocabulary-details">
            <spinner v-if="isLoading" />

            <ion-card v-if="!isLoading && Object.keys(vocabulary).length">
                <ion-card-content>
                    <empty-container v-if="showDefaultMessage" :message="defaultMessage" />

                    <view v-for="(definition, definitionIndex) in vocabulary.definitions" :key="definition.id">
                        <span>
                            {{ definitionIndex === 0 ? 'Meaning of' : 'Another Meaning of' }}
                            <strong>{{ vocabulary.word }}</strong>
                        </span>
                        <hr class="solid" />

                        <span class="capitalize">{{ definition.meaning }}</span>
                        <br />
                        <br />

                        <strong>Examples</strong>
                        <br />
                        <br />
                        <ul>
                            <view v-for="(example, index) in definition.examples" :key="index">
                                <li>
                                    <span class="capitalize">{{ example }}</span>
                                    <br />
                                    <br />
                                </li>
                            </view>
                        </ul>

                        <view v-if="definition.notes.length">
                            <strong>Notes</strong>
                            <br />
                            <br />
                            <ul>
                                <view v-for="(note, noteIndex) in definition.notes" :key="noteIndex">
                                    <li>
                                        <span class="capitalize">{{ note }}</span>
                                        <br />
                                        <br />
                                    </li>
                                </view>
                            </ul>
                        </view>

                        <view v-if="definition.externalLinks.length">
                            <strong>External Links</strong>
                            <br />
                            <br />
                            <ul>
                                <view v-for="(externalLink, index2) in definition.externalLinks" :key="index2">
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
                    </view>

                    <hr v-if="vocabulary.definitions.length && vocabulary.linkerWords.length" class="solid" />

                    <view v-if="vocabulary.linkerWords.length">
                        <strong>Relatable Words</strong>
                        <br />
                        <br />
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
                    </view>

                    <view v-if="vocabulary.genericNotes.length">
                        <strong>Generic Notes</strong>
                        <br />
                        <br />
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
                    </view>

                    <view v-if="vocabulary.genericExternalLinks.length">
                        <strong>Generic External Links</strong>
                        <br />
                        <br />
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
                    </view>
                </ion-card-content>
            </ion-card>

            <dictionary v-if="!isLoading && Object.keys(vocabulary).length" :word="vocabulary.word" />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonCard, IonCardContent } from '@ionic/vue';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import { useRoute } from 'vue-router';
import Spinner from '@/views/Spinner.vue';
import EmptyContainer from '@/views/EmptyContainer.vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import Dictionary from '@/views/Dictionary.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

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
        this.vocabulary = await HttpHandler.get<Vocabulary>(`/v1/vocabularies/${useRoute().params.id}`);
        if (
            !this.vocabulary.definitions?.length &&
            !this.vocabulary.linkerWords?.length &&
            !this.vocabulary.genericNotes?.length &&
            !this.vocabulary.genericExternalLinks?.length
        ) {
            this.showDefaultMessage = true;
        }
        this.isLoading = false;
    },
    beforeUnmount() {
        this.showDefaultMessage = false;
        this.vocabulary = {} as Vocabulary;
    },
});
</script>

<style scoped>
hr.solid {
    border-top: 2px solid #2e8b57;
    margin-left: -20px;
    margin-right: -20px;
}
</style>
