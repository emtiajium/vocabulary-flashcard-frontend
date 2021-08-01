<template>
    <ion-page>
        <firecracker-header header-title="Leitner Boxes" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <ion-card :button="true" class="no-margin" @click="toggle">
                <ion-card-content>
                    <ion-card-subtitle>
                        People often struggle to memorize vocabulary for a good amount of time. Fortunately, there are
                        several ways to overcome this.
                    </ion-card-subtitle>
                    <ion-card-subtitle v-show="seeLess"> ... See More </ion-card-subtitle>
                    <ion-card-subtitle v-show="!seeLess">
                        Sebastian Leitner, a German journalist, implemented a system based on the principle of spaced
                        repetition in which an item is repetitively reviewed until the learner gets fully satisfied.
                    </ion-card-subtitle>
                    <leitner-systems-flow v-show="!seeLess" />
                    <ion-card-subtitle v-show="!seeLess">
                        In this system, there are several boxes. If you wish to remember a newfound vocab, move the word
                        into the first box. Review it the next day and either move it to the next one if you remember
                        the meaning or keep it within the box. In this way, review the items within the second box. Move
                        it back to the previous box if you forget the definitions but if everything is okay, then
                        forward it to the next box. You have already read the same vocabulary for two days. Take a rest
                        for a day and review it on the third day. Review it on the fourth day. Move it forward or
                        backwards and again on the seventh day, review it again.
                    </ion-card-subtitle>
                </ion-card-content>
            </ion-card>
            <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <leitner-single-box :box="1" />
                    </ion-col>
                    <ion-col size="6">
                        <leitner-single-box :box="2" />
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <leitner-single-box :box="3" />
                    </ion-col>
                    <ion-col size="6">
                        <leitner-single-box :box="4" />
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col size="3" />
                    <ion-col size="6">
                        <leitner-single-box :box="5" />
                    </ion-col>
                    <ion-col size="3" />
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCardSubtitle, IonCardContent, IonCard } from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import LeitnerSingleBox from '@/views/LeitnerSingleBox.vue';
import LeitnerSystemsFlow from '@/views/LeitnerSystemsFlow.vue';

export default defineComponent({
    name: 'LeitnerSystems',
    components: {
        FirecrackerHeader,
        LeitnerSingleBox,
        LeitnerSystemsFlow,
        IonContent,
        IonPage,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonCardSubtitle,
        IonCardContent,
    },
    data() {
        return {
            seeLess: true,
        };
    },
    methods: {
        toggle(): void {
            this.seeLess = !this.seeLess;
        },
    },
});
</script>

<style scoped>
.no-margin {
    margin: unset;
    margin-inline: unset;
}
</style>
