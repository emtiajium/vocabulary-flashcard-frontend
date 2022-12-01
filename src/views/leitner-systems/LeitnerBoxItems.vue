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
                <ion-card-subtitle class="ion-padding ion-text-center">
                    Things are pretty quiet right now.
                </ion-card-subtitle>

                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <font-awesome-icon :icon="faGlassCheers" class="firecracker-primary-color-icon-60pt" />
                </view>

                <ion-card-subtitle v-if="box === '1' && totalItems === 0" class="ion-padding ion-text-center">
                    <span class="link-container">
                        But beginning the journey with Leitner System is super easy. All you need to do is create a
                        flashcard by pressing the
                        <font-awesome-icon :icon="faHeartRegular" class="leitner-icon" /> icon on the
                        <router-link to="/vocabularies"> vocabulary card </router-link>. After that, the vocabulary will
                        immediately place into the "{{ headerTitle }}".
                    </span>
                </ion-card-subtitle>

                <ion-card-subtitle v-if="box !== '1' && totalItems > 0" class="ion-padding ion-text-center">
                    <span v-if="!singleLeitnerItemEarlierToBoxAppearanceDate?.vocabulary">
                        Items will only appear when it is the right time.
                    </span>
                    <span v-if="singleLeitnerItemEarlierToBoxAppearanceDate?.vocabulary">
                        Items will only appear when it is the right time. For example, the vocabulary "{{
                            singleLeitnerItemEarlierToBoxAppearanceDate.vocabulary.word
                        }}" will appear on
                        <ion-datetime
                            :value="singleLeitnerItemEarlierToBoxAppearanceDate.boxAppearanceDate"
                            display-format="MMMM, DD."
                            class="updated-at"
                            :disabled="true"
                            :readonly="true"
                        />
                    </span>
                </ion-card-subtitle>
            </view>

            <ion-row
                v-for="boxItem in boxItems"
                :key="boxItem.vocabularyId"
                class="display-flex ion-justify-content-center item-container"
            >
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="8" sizeXl="8">
                    <ion-card class="margin-top-bottom-unset">
                        <ion-card-header>
                            <ion-card-title class="display-flex ion-justify-content-center capitalize">
                                {{ boxItem.word }}
                            </ion-card-title>
                            <ion-card-subtitle class="display-flex ion-justify-content-center capitalize">
                                <ion-row>
                                    <font-awesome-icon :icon="faCalendarAlt" class="firecracker-primary-color-icon" />
                                    <ion-datetime
                                        :value="boxItem.updatedAt"
                                        display-format="MMMM DD, YYYY"
                                        class="updated-at padding-right-10"
                                        :disabled="true"
                                        :readonly="true"
                                    />
                                    <font-awesome-icon :icon="faClock" class="firecracker-primary-color-icon" />
                                    <ion-datetime
                                        :value="boxItem.updatedAt"
                                        display-format="hh:mm A"
                                        class="updated-at"
                                        :disabled="true"
                                        :readonly="true"
                                    />
                                </ion-row>
                            </ion-card-subtitle>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-row class="ion-justify-content-center">
                                <ion-button
                                    aria-label="Move to the previous box"
                                    fill="outline"
                                    size="small"
                                    shape="round"
                                    :strong="true"
                                    color="warning"
                                    class="margin-10"
                                    :disabled="isFirstBox()"
                                    @click="moveBackward(boxItem.vocabularyId)"
                                >
                                    <font-awesome-icon :icon="faThumbsDown" />
                                </ion-button>
                                <ion-button
                                    aria-label="Move to the next box"
                                    fill="outline"
                                    size="small"
                                    shape="round"
                                    :strong="true"
                                    color="primary"
                                    class="margin-10"
                                    :disabled="isLastBox()"
                                    @click="moveForward(boxItem.vocabularyId)"
                                >
                                    <font-awesome-icon :icon="faThumbsUp" />
                                </ion-button>
                                <ion-button
                                    aria-label="View vocabulary details"
                                    fill="outline"
                                    size="small"
                                    shape="round"
                                    :strong="true"
                                    color="fern-green"
                                    class="margin-10"
                                    @click="seeMore(boxItem.vocabularyId, boxItem.word)"
                                >
                                    <font-awesome-icon :icon="faUnlockAlt" />
                                </ion-button>
                            </ion-row>
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
    IonInfiniteScroll,
    IonPage,
    IonRow,
} from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import LeitnerBoxItem from '@/domains/LeitnerBoxItem';
import HttpHandler from '@/utils/HttpHandler';
import Pagination from '@/domains/Pagination';
import { Components } from '@ionic/core/components';
import Spinner from '@/views/shared/Spinner.vue';
import NetworkError from '@/views/shared/NetworkError.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faCalendarAlt,
    faClock,
    faGlassCheers,
    faThumbsDown,
    faThumbsUp,
    faUnlockAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import Toast from '@/utils/Toast';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import * as _ from 'lodash';
import NativeStorage from '@/utils/NativeStorage';
import LeitnerBoxItemSearchResult, {
    SingleLeitnerItemEarlierToBoxAppearanceDate,
} from '@/domains/LeitnerBoxItemSearchResult';

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
            totalItems: Number.parseInt(this.$route.params.count.toString(), 10),
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
            boxItems: [] as LeitnerBoxItem[],
            singleLeitnerItemEarlierToBoxAppearanceDate: {} as SingleLeitnerItemEarlierToBoxAppearanceDate,
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
            faHeartRegular,
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
            this.singleLeitnerItemEarlierToBoxAppearanceDate = {} as SingleLeitnerItemEarlierToBoxAppearanceDate;
            this.pageNumber = 1;
            this.isDisabled = false;
            this.allQuietOnTheWesternFront = false;
            this.isNetworkError = false;
        },

        async findBoxItems(): Promise<LeitnerBoxItemSearchResult> {
            const payload: Payload = {
                pagination: {
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                },
            };
            let searchResult;
            try {
                searchResult = await HttpHandler.post<Payload, LeitnerBoxItemSearchResult>(
                    `/v1/leitner-systems/items/${this.box}`,
                    payload,
                );
                this.isNetworkError = false;
            } catch {
                this.isNetworkError = true;
                searchResult = { results: [], total: 0 };
            }
            return searchResult as LeitnerBoxItemSearchResult;
        },

        async renderBoxItems(event?: CustomEvent<void>): Promise<void> {
            const { results, total, singleLeitnerItemEarlierToBoxAppearanceDate } = await this.findBoxItems();
            this.singleLeitnerItemEarlierToBoxAppearanceDate = singleLeitnerItemEarlierToBoxAppearanceDate;
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
            this.totalItems -= 1;
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

.margin-10 {
    margin: 10px;
}

.item-container:last-of-type {
    margin-bottom: 5px;
}

.leitner-icon {
    color: var(--ion-color-primary);
    padding-left: 5px;
    padding-right: 5px;
}
</style>
