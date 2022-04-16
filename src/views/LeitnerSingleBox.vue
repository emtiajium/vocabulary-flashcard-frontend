<template>
    <ion-card :button="true" class="transparent margin-top-bottom-unset" @click="navigate">
        <ion-card-content class="no-padding">
            <ion-row class="display-flex ion-justify-content-center icon-container">
                <empty-box :color="colors[box]"></empty-box>
            </ion-row>
            <ion-row class="display-flex ion-justify-content-center">
                <ion-card-subtitle> {{ mappedBoxWithDays[`BOX_${box}`] }} Box </ion-card-subtitle>
            </ion-row>
            <ion-row class="display-flex ion-justify-content-center count-container">
                <spinner v-if="count === -1" />
                <ion-card-subtitle v-if="count !== -1"> {{ count }} Vocab </ion-card-subtitle>
            </ion-row>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardContent, IonCardSubtitle, IonRow } from '@ionic/vue';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import Spinner from '@/views/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';
import EmptyBox from '@/media/EmptyBox.vue';

export default defineComponent({
    name: 'LeitnerSingleBox',
    components: {
        EmptyBox,
        Spinner,
        IonCard,
        IonCardContent,
        IonCardSubtitle,
        IonRow,
    },
    props: ['box', 'count'],
    data() {
        return {
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
            // generated color using
            // https://material.io/design/color/the-color-system.html#tools-for-picking-colors
            colors: {
                '1': '#66BB6A',
                '2': '#43A047',
                '3': '#388E3C',
                '4': '#2E7D32',
                '5': '#1B5E20',
            },
        };
    },
    methods: {
        async navigate(): Promise<void> {
            await NativeStorage.setShouldReloadLeitnerItems();
            await this.$router.push(`/leitner-box/items/${this.box}/${this.count}`);
        },
    },
});
</script>

<style scoped>
.no-padding {
    padding-top: unset;
    padding-bottom: unset;
}
.icon-container {
    margin-top: 15px;
    margin-bottom: 5px;
}
.count-container {
    margin-bottom: 10px;
}
</style>
