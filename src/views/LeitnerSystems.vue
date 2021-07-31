<template>
    <ion-page>
        <firecracker-header header-title="Leitner Boxes" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <leitner-systems-flow />
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
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/vue';
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
    },
});
</script>

<style scoped></style>
