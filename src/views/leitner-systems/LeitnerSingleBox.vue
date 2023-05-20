<template>
    <ion-card :button="true" class="transparent margin-top-bottom-unset" @click="navigate">
        <ion-card-content class="no-padding">
            <ion-row class="display-flex ion-justify-content-center icon-container">
                <empty-box-icon :color-variable="colors[box]"></empty-box-icon>
            </ion-row>
            <ion-row class="display-flex ion-justify-content-center">
                <ion-card-subtitle> {{ mappedBoxWithDays[`BOX_${box}`] }} Box </ion-card-subtitle>
            </ion-row>
            <ion-row class="display-flex ion-justify-content-center count-container">
                <spinner v-if="count === -1 && error === false" />
                <ion-card-subtitle v-if="count !== -1 && error === false">
                    {{ count }} {{ count > 1 ? 'Vocabs' : 'Vocab' }}
                </ion-card-subtitle>
            </ion-row>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardContent, IonCardSubtitle, IonRow } from '@ionic/vue';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import Spinner from '@/views/shared/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';
import EmptyBoxIcon from '@/media/EmptyBoxIcon.vue';

export default defineComponent({
    name: 'LeitnerSingleBox',
    components: {
        EmptyBoxIcon,
        Spinner,
        IonCard,
        IonCardContent,
        IonCardSubtitle,
        IonRow,
    },
    props: ['box', 'count', 'error'],
    data() {
        return {
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
            colors: {
                '1': '--leitner-box-1',
                '2': '--leitner-box-2',
                '3': '--leitner-box-3',
                '4': '--leitner-box-4',
                '5': '--leitner-box-5',
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
    margin-top: var(--ion-margin);
    margin-bottom: calc(var(--ion-margin) / 2);
}
.count-container {
    margin-bottom: var(--ion-margin);
}
</style>
