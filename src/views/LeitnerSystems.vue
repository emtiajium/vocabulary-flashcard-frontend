<template>
    <ion-page>
        <firecracker-header header-title="Leitner Boxes" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <leitner-single-box :count="count" :box="1" :navigate="navigate" />
                    </ion-col>
                    <ion-col size="6">
                        <leitner-single-box :count="count" :box="2" :navigate="navigate" />
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <leitner-single-box :count="count" :box="3" :navigate="navigate" />
                    </ion-col>
                    <ion-col size="6">
                        <leitner-single-box :count="count" :box="4" :navigate="navigate" />
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col size="3" />
                    <ion-col size="6">
                        <leitner-single-box :count="count" :box="5" :navigate="navigate" />
                    </ion-col>
                    <ion-col size="3" />
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import HttpHandler from '@/utils/HttpHandler';
import LeitnerSingleBox from '@/views/LeitnerSingleBox.vue';

export default defineComponent({
    name: 'LeitnerSystems',
    components: {
        FirecrackerHeader,
        LeitnerSingleBox,
        IonContent,
        IonPage,
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
    methods: {
        async navigate(box: number): Promise<void> {
            await this.$router.push(`/leitner-box/items/${box}`);
        },

        async countBoxItem(box: number): Promise<number> {
            return HttpHandler.get<number>(`/v1/leitner-systems/items/count/${box}`);
        },

        async countBoxesItem(): Promise<void> {
            await Promise.all(
                this.placeholderItems.map((box) => {
                    return this.countBoxItem(box).then((count) => {
                        this.count[box] = count;
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

<style scoped></style>
