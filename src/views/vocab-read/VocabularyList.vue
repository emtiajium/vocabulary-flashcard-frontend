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
            :modify-settings="openSettingsPopover"
        />

        <ion-content :fullscreen="true" id="vocabulary-list">
            <ion-row
                v-if="
                    allQuietOnTheWesternFront &&
                    !searchKeyword.length &&
                    !this.fetchNotHavingDefinitionOnly &&
                    !isNetworkError
                "
                class="display-flex ion-justify-content-center"
            >
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <ion-card class="margin-top-unset">
                        <ion-card-content>
                            <view class="display-flex ion-justify-content-center">
                                <ion-item lines="none">
                                    <span class="material-icons firecracker-primary-color-icon-60pt"> campaign </span>
                                </ion-item>
                            </view>
                            <ion-card-subtitle class="ion-text-center ion-padding">
                                Looks like you do not have any vocabulary in your cohort yet! We can generate a few if
                                you wish. All you need is to click the button below and wait a bit! And FYI, you may
                                remove those later.
                            </ion-card-subtitle>
                            <view class="display-flex ion-justify-content-center ion-padding">
                                <ion-item lines="none">
                                    <ion-button @click="bootstrap" size="large"> Fetch </ion-button>
                                </ion-item>
                            </view>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>

            <spinner v-if="showSpinner" />

            <view v-if="isDisabled && vocabularies.length === 0 && searchKeyword.length > 2 && !isNetworkError">
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
                    <span class="ion-text-center">
                        {{ `No vocabulary was found for "${searchKeyword}"` }}
                    </span>
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <span class="material-icons firecracker-primary-color-icon-60pt"> manage_search </span>
                </view>
            </view>

            <view
                v-if="
                    vocabularies.length === 0 &&
                    this.fetchNotHavingDefinitionOnly &&
                    !isNetworkError &&
                    !searchKeyword.length
                "
            >
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
                    <span class="ion-text-center"> No vocabulary was found without definition </span>
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faThumbsUp" class="firecracker-primary-color-icon-60pt" />
                </view>
            </view>

            <ion-row
                v-for="vocabulary in vocabularies"
                :key="vocabulary.id"
                class="display-flex ion-justify-content-center"
            >
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <minified-vocabulary
                        :vocabulary="vocabulary"
                        :delete-vocabulary="disappearVocabularyFromUI"
                        :update-leitner-box-existence="updateLeitnerBoxExistence"
                    />
                </ion-col>
            </ion-row>

            <view v-if="isDisabled && vocabularies.length > 0 && !isNetworkError">
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
                    <span class="ion-text-center">
                        {{
                            vocabularies.length > 10
                                ? `Congrats! You have viewed the last vocabulary!`
                                : `Looks like there is no other vocabulary left for you to be displayed.`
                        }}
                    </span>
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faGlassCheers" class="firecracker-primary-color-icon-60pt" />
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

            <ion-fab v-if="totalVocabularies > 0" vertical="bottom" horizontal="center" slot="fixed">
                <ion-chip class="vocab-count">
                    <span> {{ totalVocabularies }} Vocabs </span>
                </ion-chip>
            </ion-fab>

            <settings
                :is-settings-popover-opened="isSettingsPopoverOpened"
                :selected-sort="selectedSort"
                :close-settings-popover="closeSettingsPopover"
                :apply-settings="applySettings"
                :on-change-sort="onChangeSort"
                :fetch-not-having-definition-only="fetchNotHavingDefinitionOnly"
                :on-change-fetch-not-having-definition-only="onChangeFetchNotHavingDefinitionOnly"
                :vocabulary-search-coverage="vocabularySearchCoverage"
                :on-change-searching-coverage="onChangeSearchingCoverage"
            />
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
    IonRow,
    IonCol,
    IonChip,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import HttpHandler from '@/utils/HttpHandler';
import SearchResult from '@/domains/SearchResult';
import Vocabulary from '@/domains/Vocabulary';
import VocabularySearch from '@/domains/VocabularySearch';
import { Components } from '@ionic/core/components';
import MinifiedVocabulary from '@/views/vocab-read/MinifiedVocabulary.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faGlassCheers, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import NetworkError from '@/views/shared/NetworkError.vue';
import NativeStorage from '@/utils/NativeStorage';
import Spinner from '@/views/shared/Spinner.vue';
import * as _ from 'lodash';
import Sort, { SortDirection, SupportedSortFields } from '@/domains/Sort';
import { isObjectEqual } from '@/utils/is-equal';
import Settings from '@/views/vocab-read/Settings.vue';
import VocabularySearchCoverage from '@/domains/VocabularySearchCoverage';

type IonInfiniteScrollType = Components.IonInfiniteScroll;
type IonRefresherType = Components.IonRefresher;

export default defineComponent({
    name: 'VocabularyList',
    components: {
        Settings,
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
        IonRow,
        IonCol,
        IonChip,
    },
    data() {
        return {
            showSpinner: false,
            faPlus,
            faGlassCheers,
            faThumbsUp,
            vocabularies: [] as Vocabulary[],
            pageNumber: 1,
            pageSize: 10,
            isDisabled: false,
            allQuietOnTheWesternFront: false,
            isNetworkError: false,
            searchKeyword: '',
            totalVocabularies: 0,
            isSettingsPopoverOpened: false,
            selectedSort: `${SupportedSortFields.updatedAt}_${SortDirection.DESC}`,
            sort: {
                field: SupportedSortFields.updatedAt,
                direction: SortDirection.DESC,
            } as Sort,
            fetchNotHavingDefinitionOnly: false,
            vocabularySearchCoverage: {
                word: true,
                linkerWords: false,
                genericNotes: false,
                meaning: false,
                examples: false,
                notes: false,
            },
        };
    },
    async mounted() {
        this.showSpinner = true;
        await this.setSettingsStuff();
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
            // no resetting of "sort" and other settings
        },

        async setSettingsStuff(): Promise<void> {
            const vocabSettings = await NativeStorage.getVocabSettings();
            if (!_.isEmpty(vocabSettings)) {
                const { sort: selectedSort, fetchNotHavingDefinitionOnly, vocabularySearchCoverage } = vocabSettings;
                this.onChangeSort(`${selectedSort.field}_${selectedSort.direction}`);
                this.onChangeSearchingCoverage(vocabularySearchCoverage);
                this.onChangeFetchNotHavingDefinitionOnly(fetchNotHavingDefinitionOnly);
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
                        if (this.fetchNotHavingDefinitionOnly && updatedVocabulary.definitions?.length) {
                            this.disappearVocabularyFromUI(updatedVocabulary.id);
                        } else if (!this.fetchNotHavingDefinitionOnly) {
                            this.updateVocabulary(updatedVocabulary);
                        }
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
            // reason to use _.uniqueBy(): https://trello.com/c/WIsMIhXr/58
            // definitely a workaround
            this.vocabularies = _.uniqBy(this.vocabularies.concat(results), 'id');
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
                vocabularySearchCoverage: this.vocabularySearchCoverage,
                fetchNotHavingDefinitionOnly: this.fetchNotHavingDefinitionOnly,
                pagination: {
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                },
                sort: this.sort,
            };
            let searchResult: SearchResult<Vocabulary>;
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

        disappearVocabularyFromUI(id: string): void {
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

        openSettingsPopover(): void {
            this.isSettingsPopoverOpened = true;
        },

        closeSettingsPopover(): void {
            this.isSettingsPopoverOpened = false;
        },

        async applySettings(): Promise<void> {
            const vocabSettings = {
                sort: this.sort,
                fetchNotHavingDefinitionOnly: this.fetchNotHavingDefinitionOnly,
                vocabularySearchCoverage: this.vocabularySearchCoverage,
            };
            if (
                !this.isSettingsPopoverOpened &&
                !isObjectEqual(_.cloneDeep(vocabSettings), (await NativeStorage.getVocabSettings()) || {})
            ) {
                NativeStorage.setVocabSettings(_.cloneDeep(vocabSettings)).finally();
                await this.refresh();
            }
        },

        onChangeSort(selectedOption: string): void {
            this.selectedSort = selectedOption;
            const [field, direction] = selectedOption.split('_');
            this.sort = {
                field,
                direction: direction as SortDirection,
            };
        },

        onChangeFetchNotHavingDefinitionOnly(fetchNotHavingDefinitionOnly: boolean): void {
            this.fetchNotHavingDefinitionOnly = fetchNotHavingDefinitionOnly;
        },

        onChangeSearchingCoverage(vocabularySearchCoverage: VocabularySearchCoverage): void {
            this.vocabularySearchCoverage = vocabularySearchCoverage;
        },
    },
});
</script>

<style scoped></style>
