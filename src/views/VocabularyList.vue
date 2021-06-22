<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>Vocabularies</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-list>
                <ion-item v-for="(vocabulary, index) in vocabularies" :key="vocabulary.id">
                    <ion-label>{{ `${index} ${vocabulary.word}` }}</ion-label>
                </ion-item>
            </ion-list>

            <ion-infinite-scroll
                @ionInfinite="findVocabularies($event)"
                threshold="100px"
                id="infinite-scroll"
                :disabled="isDisabled"
            >
                <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Loading more data...">
                </ion-infinite-scroll-content>
            </ion-infinite-scroll>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button>
                    <ion-icon :icon="add" @click="$router.push('/add-vocabulary')"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonFab,
    IonFabButton,
    IonList,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { defineComponent } from 'vue';
import HttpHandler from '@/utils/HttpHandler';
import NativeStorage from '@/utils/NativeStorage';
import SearchResult from '@/domains/SearchResult';
import Vocabulary from '@/domains/Vocabulary';
import VocabularySearch from '@/domains/VocabularySearch';

export default defineComponent({
    name: 'VocabularyList',
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonIcon,
        IonFab,
        IonFabButton,
        IonList,
        IonInfiniteScroll,
        IonInfiniteScrollContent,
    },
    data() {
        return { add, cohortId: '', vocabularies: [] as Vocabulary[], pageNumber: 1, isDisabled: false };
    },
    async mounted() {
        this.cohortId = await NativeStorage.getCohortId();
        await this.findVocabularies();
    },
    methods: {
        async findVocabularies(event?: CustomEvent<void>) {
            const vocabularySearch = {
                cohortId: this.cohortId,
                pagination: {
                    pageSize: 10,
                    pageNumber: this.pageNumber,
                },
            } as VocabularySearch;
            const { results, total } = (await HttpHandler.post<VocabularySearch, SearchResult<Vocabulary>>(
                '/v1/vocabularies/search',
                vocabularySearch,
            )) as SearchResult<Vocabulary>;
            this.vocabularies = this.vocabularies.concat(results);
            this.pageNumber += 1;
            this.isDisabled = this.vocabularies.length >= total;
            if (event?.target) {
                (event as CustomEvent).target.disabled = this.isDisabled;
                event.target.complete();
            }
        },
    },
});
</script>

<style scoped></style>
