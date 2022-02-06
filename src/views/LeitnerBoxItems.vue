<template>
    <ion-page>
        <firecracker-header
            :header-title="headerTitle"
            content-id="leitner-box-items"
            menu-id="leitner-box-items-menu"
            type="BACK"
        />
        <ion-content :fullscreen="true" id="leitner-box-items">
            <spinner v-if="showSpinner && !isNetworkError" />

            <view v-if="allQuietOnTheWesternFront && !isNetworkError">
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding ion-text-center">
                    "All Quiet on the Western Front"
                </ion-card-subtitle>
                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faGlassCheers" class="firecracker-icon" />
                </view>
                <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding ion-text-center">
                    Items will only appear when it is the right time
                </ion-card-subtitle>
            </view>

            <ion-row
                v-for="boxItem in boxItems"
                :key="boxItem.vocabularyId"
                class="display-flex ion-justify-content-center"
            >
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="8" sizeXl="8">
                    <ion-card class="no-margin">
                        <ion-card-header>
                            <ion-card-title class="display-flex ion-justify-content-center capitalize">
                                {{ boxItem.word }}
                            </ion-card-title>
                            <ion-card-subtitle class="display-flex ion-justify-content-center capitalize">
                                <ion-row>
                                    <font-awesome-icon :icon="faCalendarAlt" class="firecracker-primary-colored-icon" />
                                    <ion-datetime
                                        :value="boxItem.updatedAt"
                                        display-format="MMMM DD, YYYY"
                                        class="updated-at padding-right-10"
                                        :disabled="true"
                                    />
                                    <font-awesome-icon :icon="faClock" class="firecracker-primary-colored-icon" />
                                    <ion-datetime
                                        :value="boxItem.updatedAt"
                                        display-format="hh:mm A"
                                        class="updated-at"
                                        :disabled="true"
                                    />
                                </ion-row>
                            </ion-card-subtitle>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-grid>
                                <ion-row>
                                    <ion-col size="3" />
                                    <ion-col size="2" class="display-flex ion-justify-content-end">
                                        <ion-button
                                            fill="outline"
                                            size="small"
                                            shape="round"
                                            :strong="true"
                                            color="warning"
                                            :disabled="isFirstBox()"
                                            @click="moveBackward(boxItem.vocabularyId)"
                                        >
                                            <font-awesome-icon :icon="faThumbsDown" />
                                        </ion-button>
                                    </ion-col>
                                    <ion-col size="2" class="display-flex ion-justify-content-center">
                                        <ion-button
                                            fill="outline"
                                            size="small"
                                            shape="round"
                                            :strong="true"
                                            color="primary"
                                            :disabled="isLastBox()"
                                            @click="moveForward(boxItem.vocabularyId)"
                                        >
                                            <font-awesome-icon :icon="faThumbsUp" />
                                        </ion-button>
                                    </ion-col>
                                    <ion-col size="2" class="display-flex ion-justify-content-start">
                                        <ion-button
                                            fill="outline"
                                            size="small"
                                            shape="round"
                                            :strong="true"
                                            color="fern-green"
                                            @click="seeMore(boxItem.vocabularyId, boxItem.word)"
                                        >
                                            <font-awesome-icon :icon="faUnlockAlt" />
                                        </ion-button>
                                    </ion-col>
                                    <ion-col size="3" />
                                </ion-row>
                            </ion-grid>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>

            <network-error v-if="isNetworkError" />

            <ion-infinite-scroll
                @ionInfinite="renderBoxItems($event)"
                threshold="100px"
                id="infinite-scroll"
                :disabled="isDisabled"
            >
                <spinner />
            </ion-infinite-scroll>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonDatetime,
    IonGrid,
    IonInfiniteScroll,
    IonPage,
    IonRow,
} from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import LeitnerBoxItem from '@/domains/LeitnerBoxItem';
import SearchResult from '@/domains/SearchResult';
import HttpHandler from '@/utils/HttpHandler';
import Pagination from '@/domains/Pagination';
import { Components } from '@ionic/core/components';
import Spinner from '@/views/Spinner.vue';
import NetworkError from '@/views/NetworkError.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faCalendarAlt,
    faClock,
    faGlassCheers,
    faThumbsDown,
    faThumbsUp,
    faUnlockAlt,
} from '@fortawesome/free-solid-svg-icons';
import Toast from '@/utils/Toast';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import * as _ from 'lodash';
import NativeStorage from '@/utils/NativeStorage';

interface Payload {
    pagination: Pagination;
}

type IonInfiniteScrollType = Components.IonInfiniteScroll;

export default defineComponent({
    name: 'LeitnerBoxItems',
    components: {
        FirecrackerHeader,
        Spinner,
        NetworkError,
        IonContent,
        IonPage,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonInfiniteScroll,
        IonCardContent,
        IonGrid,
        IonRow,
        IonCol,
        IonButton,
        FontAwesomeIcon,
        IonDatetime,
    },
    data() {
        const box = this.$route.params.box.toString();
        return {
            box,
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
            boxItems: [] as LeitnerBoxItem[],
            showSpinner: false,
            pageNumber: 1,
            pageSize: 10,
            isDisabled: false,
            allQuietOnTheWesternFront: false,
            isNetworkError: false,
            faUnlockAlt,
            faThumbsUp,
            faThumbsDown,
            faGlassCheers,
            faClock,
            faCalendarAlt,
            headerTitle: `${MappedLeitnerBoxWithDays[`BOX_${box}`]} Box` || '',
        };
    },
    async ionViewDidEnter() {
        if (!this.boxItems.length || this.isNetworkError || (await NativeStorage.getShouldReloadLeitnerItems())) {
            await this.refresh();
            NativeStorage.removeShouldReloadLeitnerItems().catch().finally();
        }
        this.assertRefreshWord().finally();
    },
    methods: {
        clean(): void {
            this.showSpinner = false;
            this.boxItems = [] as LeitnerBoxItem[];
            this.pageNumber = 1;
            this.isDisabled = false;
            this.allQuietOnTheWesternFront = false;
            this.isNetworkError = false;
        },

        async findBoxItems(): Promise<SearchResult<LeitnerBoxItem>> {
            const payload: Payload = {
                pagination: {
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                },
            };
            let searchResult;
            try {
                searchResult = await HttpHandler.post<Payload, SearchResult<LeitnerBoxItem>>(
                    `/v1/leitner-systems/items/${this.box}`,
                    payload,
                );
                this.isNetworkError = false;
            } catch {
                this.isNetworkError = true;
                searchResult = { results: [], total: 0 };
            }
            return searchResult as SearchResult<LeitnerBoxItem>;
        },

        async renderBoxItems(event?: CustomEvent<void>): Promise<void> {
            const { results, total } = await this.findBoxItems();
            if (!total) {
                this.allQuietOnTheWesternFront = true;
            }
            // workaround
            // after moving an item to the next box
            // this.refresh() is not being executed
            // and as this.pageNumber is re-calculated
            // there is a chance of getting an item that has been retrieved earlier
            this.boxItems = _.uniqBy(this.boxItems.concat(results), 'vocabularyId');
            this.pageNumber += 1;
            this.isDisabled = this.boxItems.length >= total;
            if (event?.target) {
                ((event as CustomEvent).target as unknown as IonInfiniteScrollType).disabled = this.isDisabled;
                await ((event as CustomEvent).target as unknown as IonInfiniteScrollType).complete();
            }
        },

        async refresh(): Promise<void> {
            this.clean();
            this.showSpinner = true;
            await this.renderBoxItems();
            this.showSpinner = false;
        },

        async seeMore(id: string, word: string): Promise<void> {
            await this.$router.push(`/vocabulary/read/${id}/${word}/${true}`);
        },

        isFirstBox(): boolean {
            return Number.parseInt(this.box, 10) === 1;
        },

        isLastBox(): boolean {
            return Number.parseInt(this.box, 10) === 5;
        },

        async moveForward(vocabularyId: string): Promise<void> {
            if (!this.isLastBox()) {
                try {
                    await HttpHandler.put(`/v1/leitner-systems/forward/${vocabularyId}`);
                    await Toast.present(
                        `The vocabulary has been moved to ${
                            MappedLeitnerBoxWithDays[`BOX_${Number.parseInt(this.box, 10) + 1}`]
                        } box`,
                    );
                    await this.onKickingOutItem(vocabularyId);
                } catch (error) {
                    await Toast.present(error.message);
                }
            }
        },

        async moveBackward(vocabularyId: string): Promise<void> {
            if (!this.isFirstBox()) {
                try {
                    await HttpHandler.put(`/v1/leitner-systems/backward/${vocabularyId}`);
                    await Toast.present(
                        `The vocabulary has been moved back to ${
                            MappedLeitnerBoxWithDays[`BOX_${Number.parseInt(this.box, 10) - 1}`]
                        } box`,
                    );
                    await this.onKickingOutItem(vocabularyId);
                } catch (error) {
                    await Toast.present(error.message);
                }
            }
        },

        async onKickingOutItem(vocabularyId: string): Promise<void> {
            this.boxItems = _.filter(this.boxItems, (boxItem) => {
                return boxItem.vocabularyId !== vocabularyId;
            });
            if (this.pageNumber * this.pageSize > this.boxItems.length) {
                this.pageNumber = this.pageNumber > 1 ? this.pageNumber - 1 : 1;
                await this.renderBoxItems();
            }
        },

        async assertRefreshWord(): Promise<void> {
            NativeStorage.getUpdatedVocabulary()
                .then((updatedVocabulary) => {
                    if (!_.isEmpty(updatedVocabulary)) {
                        this.updateWord(updatedVocabulary.id, updatedVocabulary.word);
                    }
                })
                .catch();
        },

        updateWord(vocabularyId: string, word: string): void {
            const itemIndex = _.findIndex(this.boxItems, (boxItem) => {
                return boxItem.vocabularyId === vocabularyId;
            });
            if (itemIndex !== -1) {
                this.boxItems[itemIndex].word = word;
            }
        },
    },
});
</script>

<style scoped>
.firecracker-icon {
    font-size: 60pt;
    color: var(--ion-color-primary);
}

.updated-at {
    padding-top: unset;
    padding-bottom: unset;
    opacity: inherit;
}

ion-card-header {
    padding-bottom: unset;
}

ion-card-content {
    padding-top: unset;
    padding-bottom: unset;
}

.padding-right-10 {
    padding-right: 10px;
}
</style>
