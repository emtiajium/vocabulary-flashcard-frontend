<template>
    <ion-page>
        <firecracker-header
            :header-title="`Box ${$route.params.box}`"
            content-id="leitner-box-items"
            menu-id="leitner-box-items-menu"
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
            </view>

            <view v-for="boxItem in boxItems" :key="boxItem.vocabularyId">
                <ion-card>
                    <ion-card-header>
                        <ion-card-title class="display-flex ion-justify-content-center capitalize">
                            {{ boxItem.word }}
                        </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-grid>
                            <ion-row>
                                <ion-col size="3" />
                                <ion-col size="2">
                                    <ion-button
                                        fill="outline"
                                        size="small"
                                        shape="round"
                                        :strong="true"
                                        color="warning"
                                        :disabled="isFirstBox"
                                        @click="moveBackward(boxItem.vocabularyId)"
                                    >
                                        <font-awesome-icon :icon="faThumbsDown" />
                                    </ion-button>
                                </ion-col>
                                <ion-col size="2">
                                    <ion-button
                                        fill="outline"
                                        size="small"
                                        shape="round"
                                        :strong="true"
                                        color="primary"
                                        :disabled="!isLastBox"
                                        @click="moveForward(boxItem.vocabularyId)"
                                    >
                                        <font-awesome-icon :icon="faThumbsUp" />
                                    </ion-button>
                                </ion-col>
                                <ion-col size="2">
                                    <ion-button
                                        fill="outline"
                                        size="small"
                                        shape="round"
                                        :strong="true"
                                        color="fern-green"
                                        @click="seeMore(boxItem.vocabularyId, boxItem.word)"
                                    >
                                        <font-awesome-icon :icon="faExpandAlt" />
                                    </ion-button>
                                </ion-col>
                                <ion-col size="3" />
                            </ion-row>
                        </ion-grid>
                    </ion-card-content>
                </ion-card>
            </view>

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
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonInfiniteScroll,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonCardSubtitle,
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
import { faExpandAlt, faThumbsUp, faThumbsDown, faGlassCheers } from '@fortawesome/free-solid-svg-icons';
import Toast from '@/utils/Toast';

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
    },
    data() {
        return {
            boxItems: [] as LeitnerBoxItem[],
            showSpinner: false,
            pageNumber: 1,
            pageSize: 10,
            isDisabled: false,
            allQuietOnTheWesternFront: false,
            isNetworkError: false,
            faExpandAlt,
            faThumbsUp,
            faThumbsDown,
            faGlassCheers,
        };
    },
    async ionViewDidEnter() {
        await this.refresh();
    },
    ionViewWillLeave() {
        this.clean();
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
            let boxItems;
            try {
                boxItems = await HttpHandler.post<Payload, SearchResult<LeitnerBoxItem>>(
                    `/v1/leitner-systems/items/${this.$route.params.box}`,
                    payload,
                );
                this.isNetworkError = false;
            } catch {
                this.isNetworkError = true;
                boxItems = { results: [], total: 0 };
            }
            return boxItems as SearchResult<LeitnerBoxItem>;
        },

        async renderBoxItems(event?: CustomEvent<void>): Promise<void> {
            const { results, total } = await this.findBoxItems();
            if (this.pageNumber === 1 && !total) {
                this.allQuietOnTheWesternFront = true;
            }
            this.boxItems = this.boxItems.concat(results);
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
            await this.$router.push(`/vocabulary/read/${id}/${word}`);
        },

        isFirstBox(): boolean {
            return Number.parseInt(this.$route.params.box.toString(), 10) === 1;
        },

        isLastBox(): boolean {
            return Number.parseInt(this.$route.params.box.toString(), 10) === 5;
        },

        async moveForward(vocabularyId: string): Promise<void> {
            if (!this.isLastBox()) {
                try {
                    await HttpHandler.put(`/v1/leitner-systems/forward/${vocabularyId}`);
                    await this.refresh();
                } catch (error) {
                    await Toast.present(error.message);
                }
            }
        },

        async moveBackward(vocabularyId: string): Promise<void> {
            if (!this.isFirstBox()) {
                try {
                    await HttpHandler.put(`/v1/leitner-systems/backward/${vocabularyId}`);
                    await this.refresh();
                } catch (error) {
                    await Toast.present(error.message);
                }
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
</style>
