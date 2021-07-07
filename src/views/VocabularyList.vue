<template>
    <ion-page>
        <firecracker-header header-title="Vocabularies" content-id="vocabulary-list" menu-id="vocabulary-list-menu" />

        <ion-content :fullscreen="true" id="vocabulary-list">
            <ion-card v-if="isCompletedInitialRequest && vocabularies.length === 0">
                <ion-card-content>
                    <ion-card-subtitle class="display-flex ion-justify-content-center">
                        Looks like you do not have any vocabulary in your cohort yet! We can generate a few if you wish.
                        All you need is to click the button below and wait a bit!
                    </ion-card-subtitle>
                    <view class="display-flex ion-justify-content-end">
                        <ion-item lines="none">
                            <ion-button @click="bootstrap">Fetch</ion-button>
                        </ion-item>
                    </view>
                </ion-card-content>
            </ion-card>

            <view v-for="vocabulary in vocabularies" :key="vocabulary.id">
                <minified-vocabulary :vocabulary="vocabulary" :delete-vocabulary="deleteVocabulary" />
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
                <ion-fab-button @click="$router.push('/vocabulary/create')">
                    <font-awesome-icon :icon="faPlus" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {
    IonContent,
    IonPage,
    IonFab,
    IonFabButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonButton,
    IonItem,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import HttpHandler from '@/utils/HttpHandler';
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
        MinifiedVocabulary,
        FirecrackerHeader,
        IonContent,
        IonPage,
        IonFab,
        IonFabButton,
        IonInfiniteScroll,
        IonInfiniteScrollContent,
        FontAwesomeIcon,
        IonCard,
        IonCardContent,
        IonCardSubtitle,
        IonButton,
        IonItem,
    },
    data() {
        return {
            faPlus,
            vocabularies: [] as Vocabulary[],
            pageNumber: 1,
            pageSize: 10,
            isDisabled: false,
            isCompletedInitialRequest: false,
        };
    },
    async mounted() {
        await this.renderVocabularies();
        this.isCompletedInitialRequest = true;
    },
    methods: {
        async renderVocabularies(event?: CustomEvent<void>): Promise<void> {
            const { results, total } = await this.findVocabularies();
            this.vocabularies = this.vocabularies.concat(results);
            this.pageNumber += 1;
            this.isDisabled = this.vocabularies.length >= total;
            if (event?.target) {
                ((event as CustomEvent).target as unknown as IonInfiniteScrollType).disabled = this.isDisabled;
                await ((event as CustomEvent).target as unknown as IonInfiniteScrollType).complete();
            }
        },

        async findVocabularies(): Promise<SearchResult<Vocabulary>> {
            const vocabularySearch: VocabularySearch = {
                pagination: {
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                },
            };
            return (await HttpHandler.post<VocabularySearch, SearchResult<Vocabulary>>(
                '/v1/vocabularies/search',
                vocabularySearch,
            )) as SearchResult<Vocabulary>;
        },

        deleteVocabulary(id: string): void {
            this.vocabularies = this.vocabularies.filter(({ id: vocabularyId }) => id !== vocabularyId);
        },

        async bootstrap(): Promise<void> {
            const { results, total } = await HttpHandler.post<undefined, SearchResult<Vocabulary>>(
                '/v1/vocabularies/bootstrap',
                undefined,
            );
            this.vocabularies = results;
            this.pageNumber = Number.parseInt((total / this.pageSize).toString(), 10) + 1;
            this.isDisabled = true;
        },
    },
});
</script>

<style scoped></style>
