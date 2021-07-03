<template>
    <ion-page>
        <firecracker-header header-title="Vocabularies" />

        <ion-content :fullscreen="true">
            <view v-for="vocabulary in vocabularies" :key="vocabulary.id">
                <vocabulary :vocabulary="vocabulary" :delete-vocabulary="deleteVocabulary" />
            </view>

            <ion-infinite-scroll
                @ionInfinite="renderVocabularies($event)"
                threshold="100px"
                id="infinite-scroll"
                :disabled="isDisabled"
            >
                <ion-infinite-scroll-content loading-spinner="lines" loading-text="Loading more ...">
                </ion-infinite-scroll-content>
            </ion-infinite-scroll>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button @click="$router.push('/add-vocabulary')">
                    <font-awesome-icon :icon="faPlus" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, IonFab, IonFabButton, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
import { defineComponent } from 'vue';
import HttpHandler from '@/utils/HttpHandler';
import NativeStorage from '@/utils/NativeStorage';
import SearchResult from '@/domains/SearchResult';
import Vocabulary from '@/domains/Vocabulary';
import VocabularySearch from '@/domains/VocabularySearch';
import { Components } from '@ionic/core/components';
import MinifiedVocabulary from '@/views/MinifiedVocabulary.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';

type IonInfiniteScrollType = Components.IonInfiniteScroll;

export default defineComponent({
    name: 'VocabularyList',
    components: {
        Vocabulary: MinifiedVocabulary,
        FirecrackerHeader,
        IonContent,
        IonPage,
        IonFab,
        IonFabButton,
        IonInfiniteScroll,
        IonInfiniteScrollContent,
        FontAwesomeIcon,
    },
    data() {
        return { faPlus, cohortId: '', vocabularies: [] as Vocabulary[], pageNumber: 1, isDisabled: false };
    },
    async mounted() {
        this.cohortId = await NativeStorage.getCohortId();
        await this.renderVocabularies();
    },
    methods: {
        async renderVocabularies(event?: CustomEvent<void>) {
            const { results, total } = await this.findVocabularies();
            this.vocabularies = this.vocabularies.concat(results);
            this.pageNumber += 1;
            this.isDisabled = this.vocabularies.length >= total;
            if (event?.target) {
                ((event as CustomEvent).target as unknown as IonInfiniteScrollType).disabled = this.isDisabled;
                await ((event as CustomEvent).target as unknown as IonInfiniteScrollType).complete();
            }
        },

        async findVocabularies() {
            const vocabularySearch: VocabularySearch = {
                cohortId: this.cohortId,
                pagination: {
                    pageSize: 10,
                    pageNumber: this.pageNumber,
                },
            };
            return (await HttpHandler.post<VocabularySearch, SearchResult<Vocabulary>>(
                '/v1/vocabularies/search',
                vocabularySearch,
            )) as SearchResult<Vocabulary>;
        },

        deleteVocabulary(id: string) {
            this.vocabularies = this.vocabularies.filter(({ id: vocabularyId }) => id !== vocabularyId);
        },
    },
});
</script>

<style scoped></style>
