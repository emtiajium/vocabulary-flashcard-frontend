<template>
    <ion-page>
        <firecracker-header header-title="My Flashcards" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="10" sizeXl="10">
                    <ion-card :button="true" class="margin-top-bottom-unset" @click="toggle">
                        <ion-card-content>
                            <ion-card-subtitle>
                                We often struggle to memorize vocabulary in the long run. Fortunately, there are several
                                methods available to overcome this difficulty. One of these is Leitner System.
                            </ion-card-subtitle>
                            <ion-card-subtitle v-show="seeLess" class="see-less"> ... See More </ion-card-subtitle>
                            <ion-card-subtitle v-show="!seeLess" class="see-more ion-padding-top">
                                Sebastian Leitner, a German journalist, proposed this method based on the principle of
                                spaced repetition in which items can be repetitively reviewed until the learner gets
                                fully satisfied.
                            </ion-card-subtitle>
                            <leitner-systems-flow v-show="!seeLess" class="see-more" />
                            <ion-card-subtitle v-show="!seeLess" class="see-more">
                                In this method, there are several boxes containing flashcards. If you wish to remember a
                                newly introduced vocab, move the word into the first box. Review it the next day, either
                                move it to the next one if you remember the meaning or keep it within the box. In this
                                way, review the items in the second box. Move it back to the previous box if you forget
                                the definitions, but forward it to the next box if everything is okay. As you have
                                already read the same vocabulary for two days, rest for the next day. Review it on the
                                fourth day and move it forward or backwards. Then on the seventh day, review it again.
                            </ion-card-subtitle>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>

            <ion-row class="display-flex ion-justify-content-center box-container">
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="1" :count="count[1]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="2" :count="count[2]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="3" :count="count[3]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="4" :count="count[4]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="5" :count="count[5]" />
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonPage, IonRow, IonCol, IonCardSubtitle, IonCardContent, IonCard } from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import LeitnerSingleBox from '@/views/LeitnerSingleBox.vue';
import LeitnerSystemsFlow from '@/views/LeitnerSystemsFlow.vue';
import HttpHandler from '@/utils/HttpHandler';

export default defineComponent({
    name: 'LeitnerSystems',
    components: {
        FirecrackerHeader,
        LeitnerSingleBox,
        LeitnerSystemsFlow,
        IonContent,
        IonPage,
        IonRow,
        IonCol,
        IonCard,
        IonCardSubtitle,
        IonCardContent,
    },
    data() {
        return {
            seeLess: true,
            placeholderItems: [1, 2, 3, 4, 5],
            count: [-1, -1, -1, -1, -1, -1] as number[],
        };
    },
    async ionViewDidEnter() {
        await this.countBoxesItem();
    },
    ionViewWillLeave() {
        this.clean();
    },
    methods: {
        toggle(): void {
            this.seeLess = !this.seeLess;
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
            this.count = [-1, -1, -1, -1, -1, -1];
        },
    },
});
</script>

<style scoped>
.box-container {
    margin-top: 10px;
}

@media only screen and (min-width: 768px) {
    .see-more {
        display: flex !important;
    }
    .see-less {
        display: none !important;
    }
}
</style>
