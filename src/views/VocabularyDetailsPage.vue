<template>
    <ion-page>
        <firecracker-header
            :header-title="word"
            content-id="vocabulary-details"
            menu-id="vocabulary-details-menu"
            type="BACK"
        />
        <ion-content :fullscreen="true" id="vocabulary-details">
            <vocabulary-details
                :word="word"
                :vocabulary="vocabulary"
                :disable-inserting-into-leitner-box="disableInsertingIntoLeitnerBox"
                :is-loading="isLoading"
            />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import Toast from '@/utils/Toast';
import MessageDB from '@/utils/MessageDB';
import VocabularyDetails from '@/views/VocabularyDetails.vue';
import { IonContent, IonPage } from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';

export default defineComponent({
    name: 'VocabularyDetailsPage',
    components: {
        FirecrackerHeader,
        VocabularyDetails,
        IonPage,
        IonContent,
    },
    data() {
        return {
            id: this.$route.params.id as string,
            word: (this.$route.params.word as string) || '',
            vocabulary: new Vocabulary(),
            disableInsertingIntoLeitnerBox: this.$route.params.disableInsertingIntoLeitnerBox === 'true',
            isLoading: true,
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
                this.vocabulary = await HttpHandler.get<Vocabulary>(`/v1/vocabularies/${this.id}`);
                this.word = this.vocabulary.word;
            } catch {
                await Promise.all([Toast.present(MessageDB.networkError), this.$router.back()]);
            } finally {
                this.isLoading = false;
            }
        },

        clean(): void {
            this.isLoading = true;
            this.vocabulary = new Vocabulary();
        },
    },
});
</script>

<style scoped></style>
