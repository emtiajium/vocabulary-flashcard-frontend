<template>
    <ion-page>
        <firecracker-header header-title="Leitner Boxes" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <ion-grid>
                <view v-for="placeholderItem in placeholderItems" :key="placeholderItem">
                    <ion-row>
                        <ion-col size="6">
                            <ion-card :button="true" class="transparent" @click="navigate(placeholderItem)">
                                <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                                    <img src="/assets/icon/empty-box.svg" alt="Leitner Box" class="opened-box-icon" />
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                        <ion-col size="6">
                            <ion-card :button="false" class="transparent">
                                <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                                    <spinner v-if="!count.length || typeof count[placeholderItem] === 'undefined'" />
                                    <ion-card-title
                                        v-if="count.length && typeof count[placeholderItem] !== 'undefined'"
                                    >
                                        {{ count[placeholderItem] }}
                                    </ion-card-title>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                </view>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonPage, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonCardTitle } from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import HttpHandler from '@/utils/HttpHandler';
import Spinner from '@/views/Spinner.vue';

export default defineComponent({
    name: 'LeitnerSystems',
    components: {
        Spinner,
        FirecrackerHeader,
        IonContent,
        IonPage,
        IonCard,
        IonCardContent,
        IonCardTitle,
        IonGrid,
        IonRow,
        IonCol,
    },
    data() {
        return {
            placeholderItems: [1, 2, 3, 4, 5],
            count: [] as number[],
        };
    },
    async ionViewDidEnter() {
        await this.countBoxesItem();
    },
    ionViewWillLeave() {
        this.clean();
    },
    methods: {
        async navigate(box: number): Promise<void> {
            await this.$router.push(`/leitner-box/items/${box}`);
        },

        async countBoxItem(box: number): Promise<number> {
            return HttpHandler.get<number>(`/v1/leitner-systems/items/count/${box}`);
        },

        async countBoxesItem(): Promise<void> {
            await Promise.all(
                [1, 2, 3, 4, 5].map((box) => {
                    return this.countBoxItem(box).then((count) => {
                        this.count[box] = count;
                        console.log('this.count', this.count);
                    });
                }),
            ).catch();
        },

        clean(): void {
            this.count = [];
        },
    },
});
</script>

<style scoped>
.opened-box-icon {
    max-width: 50%;
}
@media only screen and (min-device-width: 480px) {
    .opened-box-icon {
        width: 15%;
    }
}
</style>
