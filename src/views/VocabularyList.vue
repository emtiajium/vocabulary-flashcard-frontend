<template>
    <ion-page>
        <firecracker-header
            header-title="Vocabularies"
            content-id="vocabulary-list"
            menu-id="vocabulary-list-menu"
            :enable-searching="true"
            search-placeholder="Type at least 3 characters"
            :search-keyword="searchKeyword"
            :set-search-keyword="setSearchKeyword"
            :enable-settings="true"
            :modify-settings="onClosingSettingsPopover"
        />

        <ion-content :fullscreen="true" id="vocabulary-list">
            <ion-card v-if="allQuietOnTheWesternFront && !searchKeyword.length && !isNetworkError">
                <ion-card-content>
                    <ion-card-subtitle class="ion-text-center">
                        Looks like you do not have any vocabulary in your cohort yet! We can generate a few if you wish.
                        All you need is to click the button below and wait a bit! And FYI, you may remove those later.
                    </ion-card-subtitle>
                    <view class="display-flex ion-justify-content-end">
                        <ion-item lines="none">
                            <ion-button @click="bootstrap"> Fetch </ion-button>
                        </ion-item>
                    </view>
                </ion-card-content>
            </ion-card>

            <spinner v-if="showSpinner" />

            <view v-if="isDisabled && vocabularies.length === 0 && searchKeyword.length > 2 && !isNetworkError">
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
                    <span class="ion-text-center">
                        {{ `No vocabularies were found for "${searchKeyword}"` }}
                    </span>
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <span class="material-icons searching-result-zero-icon"> manage_search </span>
                </view>
            </view>

            <view v-for="vocabulary in vocabularies" :key="vocabulary.id">
                <minified-vocabulary
                    :vocabulary="vocabulary"
                    :delete-vocabulary="deleteVocabulary"
                    :update-leitner-box-existence="updateLeitnerBoxExistence"
                />
            </view>

            <view v-if="isDisabled && vocabularies.length > 0 && !isNetworkError">
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
                    <span class="ion-text-center">
                        {{
                            vocabularies.length > 10
                                ? `Congrats! You have viewed the last vocabulary!`
                                : `Looks like there is no vocabulary left for you to be displayed.`
                        }}
                    </span>
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faGlassCheers" class="loaded-all-icon" />
                </view>
            </view>

            <network-error v-if="isNetworkError" />

            <ion-infinite-scroll
                @ionInfinite="renderVocabularies($event)"
                threshold="100px"
                id="infinite-scroll"
                :disabled="isDisabled"
            >
                <spinner />
            </ion-infinite-scroll>

            <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
                <spinner />
            </ion-refresher>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button @click="$router.push('/vocabulary/create')">
                    <font-awesome-icon :icon="faPlus" />
                </ion-fab-button>
            </ion-fab>

            <ion-fab v-if="totalVocabularies > 0" vertical="center" horizontal="start" slot="fixed">
                <ion-fab-button color="warning" :disabled="true" size="small"> {{ totalVocabularies }} </ion-fab-button>
            </ion-fab>

            <ion-popover
                :is-open="isSettingsPopoverOpened"
                css-class="settings-popover"
                @didDismiss="onClosingSettingsPopover"
            >
                <ion-list lines="none">
                    <ion-radio-group :value="selectedSort" @ionChange="onChangeSort($event)">
                        <ion-list-header>
                            <ion-card-subtitle> Sorting Preference </ion-card-subtitle>
                        </ion-list-header>

                        <ion-item>
                            <ion-label> Date created (newest first) </ion-label>
                            <ion-radio slot="end" value="createdAt_DESC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Date created (oldest first) </ion-label>
                            <ion-radio slot="end" value="createdAt_ASC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Date updated (newest first) </ion-label>
                            <ion-radio slot="end" value="updatedAt_DESC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Date updated (oldest first) </ion-label>
                            <ion-radio slot="end" value="updatedAt_ASC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Word (alphabetically first) </ion-label>
                            <ion-radio slot="end" value="word_ASC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Word (alphabetically last) </ion-label>
                            <ion-radio slot="end" value="word_DESC" />
                        </ion-item>
                    </ion-radio-group>
                </ion-list>
            </ion-popover>
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
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonButton,
    IonItem,
    IonRefresher,
    IonPopover,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonList,
    IonListHeader,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import HttpHandler from '@/utils/HttpHandler';
import SearchResult from '@/domains/SearchResult';
import Vocabulary from '@/domains/Vocabulary';
import VocabularySearch from '@/domains/VocabularySearch';
import { Components } from '@ionic/core/components';
import MinifiedVocabulary from '@/views/MinifiedVocabulary.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faGlassCheers } from '@fortawesome/free-solid-svg-icons';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import NetworkError from '@/views/NetworkError.vue';
import NativeStorage from '@/utils/NativeStorage';
import Spinner from '@/views/Spinner.vue';
import * as _ from 'lodash';
import Sort, { SortDirection, SupportedSortFields } from '@/domains/Sort';
import { isObjectEqual } from '@/utils/is-equal';

type IonInfiniteScrollType = Components.IonInfiniteScroll;
type IonRefresherType = Components.IonRefresher;

export default defineComponent({
    name: 'VocabularyList',
    components: {
        Spinner,
        NetworkError,
        MinifiedVocabulary,
        FirecrackerHeader,
        IonContent,
        IonPage,
        IonFab,
        IonFabButton,
        IonInfiniteScroll,
        FontAwesomeIcon,
        IonCard,
        IonCardContent,
        IonCardSubtitle,
        IonButton,
        IonItem,
        IonRefresher,
        IonPopover,
        IonLabel,
        IonRadio,
        IonList,
        IonRadioGroup,
        IonListHeader,
    },
    data() {
        return {
            showSpinner: false,
            faPlus,
            vocabularies: [] as Vocabulary[],
            pageNumber: 1,
            pageSize: 10,
            isDisabled: false,
            allQuietOnTheWesternFront: false,
            faGlassCheers,
            isNetworkError: false,
            searchKeyword: '',
            totalVocabularies: 0,
            isSettingsPopoverOpened: false,
            selectedSort: `${SupportedSortFields.updatedAt}_${SortDirection.DESC}`,
            sort: {
                field: SupportedSortFields.updatedAt,
                direction: SortDirection.DESC,
            } as Sort,
        };
    },
    async mounted() {
        this.showSpinner = true;
        await this.setSortStuff();
        await this.renderVocabularies();
        this.showSpinner = false;
    },
    ionViewDidEnter() {
        // executing in parallel
        this.assertRefreshList();
        this.assertRefreshVocabulary();
        this.assertRefreshIsInLeitnerBox();
    },
    methods: {
        clean(): void {
            this.showSpinner = false;
            this.vocabularies = [] as Vocabulary[];
            this.pageNumber = 1;
            this.pageSize = 10;
            this.isDisabled = false;
            this.allQuietOnTheWesternFront = false;
            this.isNetworkError = false;
            this.searchKeyword = '';
            this.totalVocabularies = 0;
            this.isSettingsPopoverOpened = false;
            // no resetting of "sort"
        },

        async setSortStuff(): Promise<void> {
            const selectedSort = await NativeStorage.getVocabSort();
            if (!_.isEmpty(selectedSort)) {
                this.selectedSort = `${selectedSort.field}_${selectedSort.direction}`;
                this.sort = {
                    field: selectedSort.field,
                    direction: selectedSort.direction,
                };
            }
        },

        async assertRefreshList(): Promise<void> {
            try {
                const shouldReload = await NativeStorage.getShouldReloadVocabularies();
                if (shouldReload) {
                    this.refresh().finally();
                }
            } catch {
                this.refresh().finally();
            }
        },

        async assertRefreshVocabulary(): Promise<void> {
            NativeStorage.getUpdatedVocabulary()
                .then((updatedVocabulary) => {
                    if (!_.isEmpty(updatedVocabulary)) {
                        this.updateVocabulary(updatedVocabulary);
                    }
                })
                .catch();
        },

        async assertRefreshIsInLeitnerBox(): Promise<void> {
            NativeStorage.getLeitnerBoxExistence()
                .then((leitnerBoxExistenceVocabId) => {
                    if (leitnerBoxExistenceVocabId) {
                        this.updateLeitnerBoxExistence(leitnerBoxExistenceVocabId);
                    }
                })
                .catch();
        },

        async refresh(): Promise<void> {
            this.clean();
            this.showSpinner = true;
            await this.renderVocabularies();
            this.showSpinner = false;
        },

        async renderVocabularies(event?: CustomEvent<void>): Promise<void> {
            const { results, total } = await this.findVocabularies();
            this.vocabularies = this.vocabularies.concat(results);
            this.handleShowingFetchingFewVocabularies();
            this.pageNumber += 1;
            this.isDisabled = this.vocabularies.length >= total;
            if (event?.target) {
                ((event as CustomEvent).target as unknown as IonInfiniteScrollType).disabled = this.isDisabled;
                await ((event as CustomEvent).target as unknown as IonInfiniteScrollType).complete();
            }
        },

        async doRefresh(event: CustomEvent): Promise<void> {
            await this.refresh();
            await ((event as CustomEvent).target as unknown as IonRefresherType).complete();
        },

        handleShowingFetchingFewVocabularies(): void {
            if (this.pageNumber === 1 && !this.searchKeyword.length && !this.vocabularies.length) {
                this.allQuietOnTheWesternFront = true;
            }
        },

        async findVocabularies(): Promise<SearchResult<Vocabulary>> {
            const vocabularySearch: VocabularySearch = {
                searchKeyword: this.searchKeyword,
                pagination: {
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                },
                sort: this.sort,
            };
            let searchResult;
            try {
                searchResult = await HttpHandler.post<VocabularySearch, SearchResult<Vocabulary>>(
                    '/v1/vocabularies/search',
                    vocabularySearch,
                );
                this.isNetworkError = false;
                this.totalVocabularies = searchResult.total;
            } catch (error) {
                this.isNetworkError = true;
                searchResult = { results: [], total: 0 };
            }
            return searchResult as SearchResult<Vocabulary>;
        },

        findVocabIndex(id: string): number {
            return this.vocabularies.findIndex((vocabulary) => vocabulary.id === id);
        },

        deleteVocabulary(id: string): void {
            this.vocabularies = this.vocabularies.filter(({ id: vocabularyId }) => id !== vocabularyId);
            this.totalVocabularies -= 1;
            if (!this.vocabularies.length) {
                this.allQuietOnTheWesternFront = true;
            }
            // TODO need to handle pageNumber
        },

        updateVocabulary(updatedVocabulary: Vocabulary): void {
            try {
                this.vocabularies[this.findVocabIndex(updatedVocabulary.id)] = updatedVocabulary;
                NativeStorage.removeUpdatedVocabulary().finally();
            } catch {
                // I don't care about it!
            }
        },

        updateLeitnerBoxExistence(id: string): void {
            try {
                this.vocabularies[this.findVocabIndex(id)].isInLeitnerBox = true;
                NativeStorage.removeLeitnerBoxExistence().finally();
            } catch {
                // I don't care about it!
            }
        },

        async bootstrap(): Promise<void> {
            try {
                this.showSpinner = true;
                const { results, total } = await HttpHandler.post<undefined, SearchResult<Vocabulary>>(
                    '/v1/vocabularies/bootstrap',
                    undefined,
                );
                this.allQuietOnTheWesternFront = false;
                this.isNetworkError = false;
                this.vocabularies = results;
                this.pageNumber = Number.parseInt((total / this.pageSize).toString(), 10) + 1;
                this.isDisabled = true;
                this.totalVocabularies = total;
            } catch {
                this.isNetworkError = true;
            } finally {
                this.showSpinner = false;
            }
        },

        async setSearchKeyword(searchKeyword: string): Promise<void> {
            this.searchKeyword = searchKeyword;
            const searchKeywordLength = searchKeyword.length;
            if (searchKeywordLength === 0 || searchKeywordLength > 2) {
                this.pageNumber = 1;
                this.vocabularies = [] as Vocabulary[];
                await this.renderVocabularies();
            }
        },

        async onClosingSettingsPopover(): Promise<void> {
            this.isSettingsPopoverOpened = !this.isSettingsPopoverOpened;
            if (
                !this.isSettingsPopoverOpened &&
                !isObjectEqual(_.cloneDeep(this.sort), (await NativeStorage.getVocabSort()) || {})
            ) {
                NativeStorage.setVocabSort(_.cloneDeep(this.sort)).finally();
                await this.refresh();
            }
        },

        onChangeSort(event: CustomEvent): void {
            this.selectedSort = event.detail.value;
            const [field, direction] = event.detail.value.split('_');
            this.sort = {
                field,
                direction,
            };
        },
    },
});
</script>

<style scoped>
.loaded-all-icon {
    font-size: 60pt;
    color: var(--ion-color-primary);
}
.searching-result-zero-icon {
    font-size: 60pt;
    color: var(--ion-color-primary);
}
</style>
