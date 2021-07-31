<template>
    <ion-page>
        <firecracker-header header-title="Leitner Boxes" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <view v-for="placeholderItem in placeholderItems" :key="placeholderItem">
                <ion-card :button="true" class="transparent" @click="navigate(placeholderItem)">
                    <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                        <ion-grid>
                            <ion-row>
                                <ion-col size="12" class="display-flex ion-justify-content-center">
                                    <img src="/assets/icon/empty-box.svg" alt="Leitner Box" class="opened-box-icon" />
                                </ion-col>
                            </ion-row>
                            <ion-row :class="placeholderItem !== 5 ? 'divider' : ''">
                                <ion-col size="6" class="display-flex ion-justify-content-start padding-left-10">
                                    <ion-card-title>
                                        {{ mappedBoxWithDays[`BOX_${placeholderItem}`] }}
                                    </ion-card-title>
                                </ion-col>
                                <ion-col size="6">
                                    <spinner
                                        v-if="!count.length || typeof count[placeholderItem] === 'undefined'"
                                        class="display-flex ion-justify-content-end padding-right-10"
                                    />
                                    <ion-card-subtitle
                                        v-if="count.length && typeof count[placeholderItem] !== 'undefined'"
                                        class="display-flex ion-justify-content-end padding-right-10"
                                    >
                                        {{ count[placeholderItem] }} Vocab
                                    </ion-card-subtitle>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-card-content>
                </ion-card>
            </view>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonContent,
    IonPage,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCardTitle,
    IonCardSubtitle,
} from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import HttpHandler from '@/utils/HttpHandler';
import Spinner from '@/views/Spinner.vue';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';

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
        IonCardSubtitle,
    },
    data() {
        return {
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
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

<style scoped>
.opened-box-icon {
    max-width: 20%;
}

@media only screen and (min-device-width: 480px) {
    .opened-box-icon {
        width: 15%;
    }
}

.divider {
    border-bottom: 1px solid #ced0d4;
    padding-bottom: 8px;
}

.ion-padding-top {
    --ion-padding: 0px;
}

.ion-padding-bottom {
    --ion-padding: 0px;
}

ion-card {
    margin-inline: unset;
}

ion-grid {
    padding-inline-start: 0px;
    padding-inline-end: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
}

ion-col {
    padding-inline-start: 0px;
    padding-inline-end: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
}

.padding-left-10 {
    padding-left: 10px;
}

.padding-right-10 {
    padding-right: 10px;
}
</style>
