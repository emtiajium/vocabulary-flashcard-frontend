<template>
    <ion-page>
        <firecracker-header
            header-title="Leitner Boxes"
            content-id="leitner-box-items"
            menu-id="leitner-box-items-menu"
        />
        <ion-content :fullscreen="true" id="leitner-box-items">
            <spinner v-if="showSpinner" />
            <view v-for="boxItem in boxItems" :key="boxItem.vocabularyId">
                {{ boxItem.word }}
            </view>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonPage } from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import LeitnerBoxItem from '@/domains/LeitnerBoxItem';
import SearchResult from '@/domains/SearchResult';
import HttpHandler from '@/utils/HttpHandler';
import Pagination from '@/domains/Pagination';
import { Components } from '@ionic/core/components';
import Spinner from '@/views/Spinner.vue';

interface Payload {
    pagination: Pagination;
}

type IonInfiniteScrollType = Components.IonInfiniteScroll;

export default defineComponent({
    name: 'LeitnerBoxItems',
    components: {
        FirecrackerHeader,
        Spinner,
        IonContent,
        IonPage,
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
    },
});
</script>

<style scoped></style>
