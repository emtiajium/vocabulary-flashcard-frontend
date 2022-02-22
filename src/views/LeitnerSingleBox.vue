<template>
    <ion-card :button="true" class="transparent margin-top-bottom-unset" @click="navigate">
        <ion-card-content class="no-padding">
            <ion-row class="display-flex ion-justify-content-center opened-box-icon">
                <empty-box :color="colors[box]"></empty-box>
            </ion-row>
            <ion-row class="display-flex ion-justify-content-center">
                <ion-card-subtitle> {{ mappedBoxWithDays[`BOX_${box}`] }} Box </ion-card-subtitle>
            </ion-row>
            <ion-row class="display-flex ion-justify-content-center">
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
import EmptyBox from '@/views/EmptyBox.vue';

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
                '1': '#c7e5c5',
                '2': '#7fc47a',
                '3': '#49ac41',
                '4': '#348b2e',
                '5': '#125b11',
            },
        };
    },
    methods: {
        async navigate(): Promise<void> {
            await NativeStorage.setShouldReloadLeitnerItems();
            await this.$router.push(`/leitner-box/items/${this.box}`);
        },
    },
});
</script>

<style scoped>
.no-padding {
    padding-top: unset;
    padding-bottom: unset;
}
</style>
