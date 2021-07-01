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
                    <view v-for="definition in vocabulary.definitions" :key="definition.id">
                        <span>
                            Meaning of
                            <strong>{{ vocabulary.word }}</strong>
                        </span>
                        <br />
                        <br />
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
                            <view v-for="(externalLink, index2) in definition.externalLinks" :key="index2">
                                <a :href="externalLink" target="_blank">{{ externalLink }}</a>
                                <br />
                                <br />
                            </view>
                        </view>
                    </view>

                    <view v-if="vocabulary.linkerWords.length">
                        <strong>Linker Words</strong>
                        <br />
                        <br />
                        <view v-for="(linkerWord, linkerWordIndex) in vocabulary.linkerWords" :key="linkerWordIndex">
                            <span>{{ linkerWord }}</span>
                            <br />
                            <br />
                        </view>
                    </view>

                    <view v-if="vocabulary.genericNotes.length">
                        <strong>Generic Notes</strong>
                        <br />
                        <br />
                        <view
                            v-for="(genericNote, genericNotesIndex) in vocabulary.genericNotes"
                            :key="genericNotesIndex"
                        >
                            <span>{{ genericNote }}</span>
                            <br />
                            <br />
                        </view>
                    </view>

                    <view v-if="vocabulary.genericExternalLinks.length">
                        <strong>Generic External Links</strong>
                        <br />
                        <br />
                        <view
                            v-for="(genericExternalLink, genericExternalLinkIndex) in vocabulary.genericExternalLinks"
                            :key="genericExternalLinkIndex"
                        >
                            <a :href="genericExternalLink" target="_blank">{{ genericExternalLink }}</a>
                            <br />
                            <br />
                        </view>
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
    },
    data() {
        return {
            isLoading: true,
            vocabulary: {} as Vocabulary,
        };
    },
    async mounted() {
        this.vocabulary = await HttpHandler.get<Vocabulary>(`/v1/vocabularies/${useRoute().params.id}`);
        this.isLoading = false;
    },
});
</script>

<style scoped></style>
