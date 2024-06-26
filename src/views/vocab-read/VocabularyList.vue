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
            <ion-row v-if="shouldDisplayFetchButton()" class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <ion-card class="margin-top-unset">
                        <ion-card-content>
                            <view class="display-flex ion-justify-content-center">
                                <ion-item lines="none">
                                    <span class="material-icons firecracker-primary-color-icon-large"> campaign </span>
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

            <view v-if="shouldDisplayNoSearchResultMessage()">
                <ion-card-subtitle class="ion-padding ion-text-center">
                    {{
                        `No vocabulary was found for "${searchKeyword}". ${
                            !fetchFlashcard || !fetchNotHavingDefinitionOnly
                                ? `You may get better search results if you change your filtering preference.`
                                : ``
                        }`
                    }}
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <span class="material-icons firecracker-primary-color-icon-large"> manage_search </span>
                </view>
            </view>

            <view v-if="shouldDisplayEmptyDraftVocabMessage()">
                <ion-card-subtitle class="ion-text-center ion-padding">
                    No vocabulary was found without definition.
                    {{
                        !fetchFlashcard
                            ? `However, as "Show flashcard in boxes" is turned off, you may try to find draft vocab by turning on "Show flashcard in boxes".`
                            : ''
                    }}
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faThumbsUp" class="firecracker-primary-color-icon-large" />
                </view>
            </view>

            <view v-if="shouldDisplayEmptyNonFlashcardMessage()">
                <ion-card-subtitle class="ion-text-center ion-padding">
                    No vocabulary was found that is not in boxes.
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faThumbsUp" class="firecracker-primary-color-icon-large" />
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
                <ion-card-subtitle class="ion-padding ion-text-center">
                    {{
                        vocabularies.length > 10
                            ? `Congrats! You have viewed the last vocabulary!`
                            : `Looks like there is no other vocabulary left for you to be displayed.`
                    }}
                </ion-card-subtitle>
                <view
                    class="display-flex ion-justify-content-center ion-padding-bottom"
                    :style="cssStyleToClearlyDisplayVocabCountChip"
                >
                    <font-awesome-icon :icon="faGlassCheers" class="firecracker-primary-color-icon-large" />
                </view>
            </view>

            <network-error v-if="isNetworkError" :message="criticalErrorMessage" />

            <ion-infinite-scroll
                @ionInfinite="renderVocabularies($event)"
                threshold="100px"
                id="infinite-scroll"
                :disabled="isDisabled"
            >
                <spinner :inline-style="cssStyleToClearlyDisplayVocabCountChip" />
            </ion-infinite-scroll>

            <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
                <spinner />
            </ion-refresher>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button aria-label="Create vocabulary" @click="$router.push('/vocabulary/create')">
                    <font-awesome-icon :icon="faPlus" />
                </ion-fab-button>
            </ion-fab>

            <ion-fab v-if="totalVocabularies > 0" vertical="bottom" horizontal="center" slot="fixed">
                <ion-chip class="vocab-count">
                    <span> {{ `${totalVocabularies} ${totalVocabularies > 1 ? 'Vocabs' : 'Vocab'}` }} </span>
                </ion-chip>
            </ion-fab>

            <settings
                v-if="isSettingsPopoverOpened"
                ref="VocabSettingsRef"
                :selected-sort="selectedSort"
                :close-settings-popover="closeSettingsPopover"
                :apply-settings="applySettings"
                :on-change-sort="onChangeSort"
                :fetch-not-having-definition-only="fetchNotHavingDefinitionOnly"
                :fetch-flashcard="fetchFlashcard"
                :on-change-fetch-not-having-definition-only="onChangeFetchNotHavingDefinitionOnly"
                :on-change-fetch-flashcard="onChangeFetchFlashcard"
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
import { FirecrackerError } from '@/domains/FirecrackerError';

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
            fetchFlashcard: true,
            vocabularySearchCoverage: {
                word: true,
                linkerWords: false,
                genericNotes: false,
                meaning: false,
                examples: false,
                notes: false,
            },
            cssStyleToClearlyDisplayVocabCountChip: `margin-bottom: calc(var(--ion-margin) * 3);`,
            criticalErrorMessage: '',
        };
    },
    async mounted() {
        this.showSpinner = true;
        await this.setSettingsStuff();
        await this.renderVocabularies();
        this.showSpinner = false;
    },
    ionViewDidEnter() {
        // executing concurrently
        this.assertRefreshList();
        this.assertRefreshVocabulary();
        this.assertRefreshIsInLeitnerBox();
    },
    methods: {
        clean(): void {
            this.criticalErrorMessage = '';
            this.showSpinner = false;
            this.totalVocabularies = 0;
            this.vocabularies = [] as Vocabulary[];
            this.pageNumber = 1;
            this.pageSize = 10;
            this.isDisabled = false;
            this.allQuietOnTheWesternFront = false;
            this.isNetworkError = false;
            this.isSettingsPopoverOpened = false;
            // no resetting of "sort", search keyword and other settings
        },

        async setSettingsStuff(): Promise<void> {
            const vocabSettings = await NativeStorage.getVocabSettings();
            if (!_.isEmpty(vocabSettings)) {
                const {
                    sort: selectedSort,
                    fetchNotHavingDefinitionOnly,
                    fetchFlashcard,
                    vocabularySearchCoverage,
                } = vocabSettings;
                const defaultFetchFlashcard = true;
                this.onChangeSort(`${selectedSort.field}_${selectedSort.direction}`);
                this.onChangeSearchingCoverage(vocabularySearchCoverage);
                this.onChangeFetchNotHavingDefinitionOnly(fetchNotHavingDefinitionOnly);
                this.onChangeFetchFlashcard(fetchFlashcard ?? defaultFetchFlashcard);
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
                // eslint-disable-next-line no-param-reassign
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
                fetchFlashcard: this.fetchFlashcard,
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
                if ((error as FirecrackerError).name === 'CriticalError') {
                    this.criticalErrorMessage = (error as FirecrackerError).message;
                }
                this.isNetworkError = true;
                searchResult = { results: [], total: 0 };
            }
            return searchResult as SearchResult<Vocabulary>;
        },

        findVocabIndex(id: string): number {
            return this.vocabularies.findIndex((vocabulary) => vocabulary.id === id);
        },

        disappearVocabularyFromUI(id: string): void {
            let hasFound = false;
            this.vocabularies = this.vocabularies.filter(({ id: vocabularyId }) => {
                if (id === vocabularyId) {
                    hasFound = true;
                }
                return id !== vocabularyId;
            });
            if (hasFound) {
                this.totalVocabularies -= 1;
            }
            if (!this.vocabularies.length) {
                this.allQuietOnTheWesternFront = true;
            }
            // TODO need to handle pageNumber
        },

        updateVocabulary(updatedVocabulary: Vocabulary): void {
            try {
                this.vocabularies[this.findVocabIndex(updatedVocabulary.id)] = updatedVocabulary;
            } catch {
                // I don't care about it!
            } finally {
                NativeStorage.removeUpdatedVocabulary().finally();
            }
        },

        updateLeitnerBoxExistence(id: string): void {
            try {
                this.vocabularies[this.findVocabIndex(id)].isInLeitnerBox = true;
                if (!this.fetchFlashcard) {
                    const oneSecondInMilliseconds = 1000;
                    setTimeout(() => this.disappearVocabularyFromUI(id), oneSecondInMilliseconds);
                }
            } catch {
                // I don't care about it!
            } finally {
                NativeStorage.removeLeitnerBoxExistence().finally();
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
            } catch (error) {
                this.isNetworkError = (error as FirecrackerError).name !== 'ExistingVocabConflict';
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
            (this.$refs.VocabSettingsRef as InstanceType<typeof Settings>).isPopoverOpened = false;
            this.isSettingsPopoverOpened = false;
        },

        async applySettings(): Promise<void> {
            const vocabSettings = {
                sort: this.sort,
                fetchNotHavingDefinitionOnly: this.fetchNotHavingDefinitionOnly,
                fetchFlashcard: this.fetchFlashcard,
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

        onChangeFetchFlashcard(fetchFlashcard: boolean): void {
            this.fetchFlashcard = fetchFlashcard;
        },

        onChangeSearchingCoverage(vocabularySearchCoverage: VocabularySearchCoverage): void {
            this.vocabularySearchCoverage = vocabularySearchCoverage;
        },

        shouldDisplayFetchButton(): boolean {
            return (
                this.allQuietOnTheWesternFront &&
                !this.fetchNotHavingDefinitionOnly &&
                this.fetchFlashcard &&
                !this.isNetworkError
            );
        },

        shouldDisplayNoSearchResultMessage(): boolean {
            return (
                this.isDisabled &&
                this.vocabularies.length === 0 &&
                this.searchKeyword.length > 2 &&
                !this.isNetworkError
            );
        },

        shouldDisplayEmptyDraftVocabMessage(): boolean {
            return (
                this.vocabularies.length === 0 &&
                this.fetchNotHavingDefinitionOnly &&
                !this.isNetworkError &&
                !this.searchKeyword.length
            );
        },

        shouldDisplayEmptyNonFlashcardMessage(): boolean {
            return (
                this.vocabularies.length === 0 &&
                !this.fetchNotHavingDefinitionOnly &&
                !this.fetchFlashcard &&
                !this.isNetworkError &&
                !this.searchKeyword.length
            );
        },
    },
});
</script>

<style scoped></style>
