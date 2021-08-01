<template>
    <ion-card :button="true" class="transparent no-margin" @click="navigate">
        <ion-card-content class="no-padding">
            <ion-grid>
                <ion-row class="display-flex ion-justify-content-center">
                    <img src="/assets/icon/empty-box.svg" alt="Leitner Box" class="opened-box-icon" />
                </ion-row>
                <ion-row class="display-flex ion-justify-content-center">
                    <ion-card-subtitle> {{ mappedBoxWithDays[`BOX_${box}`] }} Box </ion-card-subtitle>
                </ion-row>
                <ion-row class="display-flex ion-justify-content-center">
                    <spinner v-if="count === -1" />
                    <ion-card-subtitle v-if="count !== -1"> {{ count }} Vocab </ion-card-subtitle>
                </ion-row>
            </ion-grid>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardContent, IonCardSubtitle, IonGrid, IonRow } from '@ionic/vue';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import Spinner from '@/views/Spinner.vue';
import HttpHandler from '@/utils/HttpHandler';

export default defineComponent({
    name: 'LeitnerSingleBox',
    components: {
        Spinner,
        IonCard,
        IonCardContent,
        IonCardSubtitle,
        IonGrid,
        IonRow,
    },
    props: ['box'],
    data() {
        return {
            count: -1,
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
        };
    },
    mounted() {
        this.countBoxItem();
    },
    beforeUnmount() {
        this.count = -1;
    },
    methods: {
        async countBoxItem(): Promise<void> {
            HttpHandler.get<number>(`/v1/leitner-systems/items/count/${this.box}`)
                .then((count) => {
                    this.count = count;
                })
                .catch();
        },

        async navigate(): Promise<void> {
            await this.$router.push(`/leitner-box/items/${this.box}`);
        },
    },
});
</script>

<style scoped>
.opened-box-icon {
    max-width: 65%;
}

@media only screen and (min-device-width: 480px) {
    .opened-box-icon {
        width: 20%;
    }
}

.no-margin {
    margin: unset;
}

.no-padding {
    padding-top: unset;
    padding-bottom: unset;
}
</style>
