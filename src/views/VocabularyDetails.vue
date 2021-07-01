<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>{{ $route.params.word }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <view v-if="isLoading">
                <spinner />
            </view>

            <ion-card v-if="!isLoading && Object.keys(vocabulary).length">
                <ion-card-content>
                    <empty-container v-if="showDefaultMessage" :message="defaultMessage" />

                    <view v-for="(definition, definitionIndex) in vocabulary.definitions" :key="definition.id">
                        <span>
                            {{ definitionIndex === 0 ? 'Meaning of' : 'Another Meaning of' }}
                            <strong>{{ vocabulary.word }}</strong>
                        </span>
                        <hr class="solid" />

                        <span>{{ definition.meaning }}</span>
                        <br />
                        <br />

                        <strong>Examples</strong>
                        <br />
                        <br />
                        <ul>
                            <view v-for="(example, index) in definition.examples" :key="index">
                                <li>
                                    <span>{{ example }}</span>
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
                                        <span>{{ note }}</span>
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
                                        <a :href="externalLink" target="_blank">{{ externalLink }}</a>
                                        <br />
                                        <br />
                                    </li>
                                </view>
                            </ul>
                        </view>
                    </view>

                    <hr v-if="vocabulary.definitions.length" class="solid" />

                    <view v-if="vocabulary.linkerWords.length">
                        <strong>Linker Words</strong>
                        <br />
                        <br />
                        <ul>
                            <view
                                v-for="(linkerWord, linkerWordIndex) in vocabulary.linkerWords"
                                :key="linkerWordIndex"
                            >
                                <li>
                                    <span>{{ linkerWord }}</span>
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
                                    <span>{{ genericNote }}</span>
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
                                    <a :href="genericExternalLink" target="_blank">{{ genericExternalLink }}</a>
                                    <br />
                                    <br />
                                </li>
                            </view>
                        </ul>
                    </view>
                </ion-card-content>
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonToolbar, IonHeader, IonTitle, IonContent, IonCard, IonCardContent } from '@ionic/vue';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import { useRoute } from 'vue-router';
import Spinner from '@/views/Spinner.vue';
import { faMehBlank } from '@fortawesome/free-regular-svg-icons';
import EmptyContainer from '@/views/EmptyContainer.vue';

export default defineComponent({
    name: 'VocabularyDetails',
    components: {
        Spinner,
        IonPage,
        IonToolbar,
        IonHeader,
        IonTitle,
        IonContent,
        IonCard,
        IonCardContent,
        EmptyContainer,
    },
    data() {
        return {
            isLoading: true,
            vocabulary: {} as Vocabulary,
            showDefaultMessage: false,
            faMehBlank,
            defaultMessage: `Looks like you haven't added anything yet!`,
        };
    },
    async mounted() {
        this.vocabulary = await HttpHandler.get<Vocabulary>(`/v1/vocabularies/${useRoute().params.id}`);
        if (
            !this.vocabulary.definitions?.length ||
            !this.vocabulary.linkerWords?.length ||
            !this.vocabulary.genericNotes?.length ||
            !this.vocabulary.genericExternalLinks?.length
        ) {
            this.showDefaultMessage = true;
        }
        this.isLoading = false;
    },
});
</script>

<style scoped>
hr.solid {
    border-top: 3px solid #495057;
    margin-left: -20px;
    margin-right: -20px;
}
</style>
