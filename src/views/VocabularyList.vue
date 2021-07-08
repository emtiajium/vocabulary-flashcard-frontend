<template>
    <ion-page>
        <firecracker-header header-title="Vocabularies" content-id="vocabulary-list" menu-id="vocabulary-list-menu" />

        <ion-content :fullscreen="true" id="vocabulary-list">
            <ion-card v-if="isCompletedInitialRequest && totalVocabularies === 0 && !isNetworkError">
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

            <view v-if="isDisabled && vocabularies.length > 0">
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
                    <span class="ion-text-center"> Congrats! You have scrolled down to the last vocabulary! </span>
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faThumbsUp" class="loaded-all-icon" />
                </view>
            </view>

            <network-error v-if="isNetworkError" />

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
import { faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import NetworkError from '@/views/NetworkError.vue';

type IonInfiniteScrollType = Components.IonInfiniteScroll;

export default defineComponent({
    name: 'VocabularyList',
    components: {
        NetworkError,
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
            faThumbsUp,
            isNetworkError: false,
            totalVocabularies: 0,
        };
    },
    async mounted() {
        await this.renderVocabularies();
        this.isCompletedInitialRequest = true;
    },
    methods: {
        async renderVocabularies(event?: CustomEvent<void>): Promise<void> {
            const { results, total } = await this.findVocabularies();
            this.totalVocabularies = total;
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
            let searchResult;
            try {
                searchResult = await HttpHandler.post<VocabularySearch, SearchResult<Vocabulary>>(
                    '/v1/vocabularies/search',
                    vocabularySearch,
                );
                this.isNetworkError = false;
            } catch (error) {
                this.isNetworkError = true;
                searchResult = { results: [], total: this.totalVocabularies };
            }
            return searchResult as SearchResult<Vocabulary>;
        },

        deleteVocabulary(id: string): void {
            this.vocabularies = this.vocabularies.filter(({ id: vocabularyId }) => id !== vocabularyId);
        },

        async bootstrap(): Promise<void> {
            try {
                const { results, total } = await HttpHandler.post<undefined, SearchResult<Vocabulary>>(
                    '/v1/vocabularies/bootstrap',
                    undefined,
                );
                this.isNetworkError = false;
                this.vocabularies = results;
                this.pageNumber = Number.parseInt((total / this.pageSize).toString(), 10) + 1;
                this.isDisabled = true;
            } catch {
                this.isNetworkError = true;
            }
        },
    },
});
</script>

<style scoped>
.loaded-all-icon {
    font-size: 60pt;
    color: #2e8b57;
}
</style>
