<template>
    <ion-page>
        <firecracker-header :header-title="word" content-id="linker-word" menu-id="linker-word-menu" type="BACK" />
        <ion-content :fullscreen="true" id="linker-word">
            <spinner v-if="isLoading" />
            <ion-row v-if="displayDictionary" class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <dictionary :word="word" :label-alignment="'center'" />
                </ion-col>
            </ion-row>
            <vocabulary-details
                v-if="!displayDictionary"
                :word="word"
                :vocabulary="vocabulary"
                :disable-inserting-into-leitner-box="false"
                :is-loading="isLoading"
            />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonRow, IonCol } from '@ionic/vue';
import Dictionary from '@/views/Dictionary.vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import Spinner from '@/views/Spinner.vue';
import VocabularyDetails from '@/views/VocabularyDetails.vue';

export default defineComponent({
    name: 'LinkerWord',
    components: {
        VocabularyDetails,
        Spinner,
        Dictionary,
        FirecrackerHeader,
        IonPage,
        IonContent,
        IonRow,
        IonCol,
    },
    data() {
        return {
            isLoading: true,
            displayDictionary: false,
            word: this.$route.params.word as string,
            vocabulary: new Vocabulary(),
        };
    },
    watch: {
        '$route.params.word': function watchWord(): void {
            this.init();
        },
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clean();
    },
    methods: {
        async init(): Promise<void> {
            this.isLoading = true;
            this.displayDictionary = false;
            this.word = this.$route.params.word as string;
            await this.loadVocabulary();
        },

        async loadVocabulary(): Promise<void> {
            try {
                this.vocabulary = await HttpHandler.get<Vocabulary>(`/v1/vocabularies/words/${this.word}`);
                this.displayDictionary = false;
            } catch {
                this.displayDictionary = true;
                this.vocabulary = new Vocabulary();
            } finally {
                this.isLoading = false;
            }
        },

        clean(): void {
            this.isLoading = true;
            this.displayDictionary = false;
            this.word = '';
            this.vocabulary = new Vocabulary();
        },
    },
});
</script>

<style scoped></style>
