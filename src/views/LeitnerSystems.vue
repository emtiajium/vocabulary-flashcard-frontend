<template>
    <ion-page>
        <firecracker-header header-title="Leitner Boxes" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <ion-card :button="true" class="box" @click="navigate(1)">
                            <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                                <font-awesome-icon :icon="faBoxOpen" class="opened-box-icon" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col size="6">
                        <ion-card :button="true" class="box" @click="navigate(2)">
                            <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                                <font-awesome-icon :icon="faBoxOpen" class="opened-box-icon" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col size="6">
                        <ion-card :button="true" class="box" @click="navigate(3)">
                            <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                                <font-awesome-icon :icon="faBoxOpen" class="opened-box-icon" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col size="6">
                        <ion-card :button="true" class="box" @click="navigate(4)">
                            <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                                <font-awesome-icon :icon="faBoxOpen" class="opened-box-icon" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col size="3" />
                    <ion-col size="6">
                        <ion-card :button="true" class="box" @click="navigate(5)">
                            <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                                <font-awesome-icon :icon="faBoxOpen" class="opened-box-icon" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col size="3" />
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonPage, IonCard, IonCardContent, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';

export default defineComponent({
    name: 'LeitnerSystems',
    components: {
        FirecrackerHeader,
        IonContent,
        IonPage,
        FontAwesomeIcon,
        IonCard,
        IonCardContent,
        IonGrid,
        IonRow,
        IonCol,
    },
    data() {
        return {
            faBoxOpen,
        };
    },
    methods: {
        async navigate(box: number): Promise<void> {
            await this.$router.push(`/leitner-box/items/${box}`);
        },
    },
});
</script>

<style scoped>
.opened-box-icon {
    font-size: 60pt;
    color: var(--ion-color-primary);
}
ion-card.box {
    --background: var(--ion-background-color);
    box-shadow: unset;
}
</style>
