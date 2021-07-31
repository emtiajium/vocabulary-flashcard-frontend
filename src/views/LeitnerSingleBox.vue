<template>
    <ion-card :button="true" class="transparent" @click="navigate(box)">
        <ion-card-content>
            <ion-grid>
                <ion-row class="display-flex ion-justify-content-center">
                    <img src="/assets/icon/empty-box.svg" alt="Leitner Box" class="opened-box-icon" />
                </ion-row>
                <ion-row class="display-flex ion-justify-content-center">
                    <ion-card-subtitle>
                        {{ mappedBoxWithDays[`BOX_${box}`] }}
                    </ion-card-subtitle>
                </ion-row>
                <ion-row class="display-flex ion-justify-content-center">
                    <spinner v-if="!count.length || typeof count[box] === 'undefined'" />
                    <ion-card-subtitle v-if="count.length && typeof count[box] !== 'undefined'">
                        {{ count[box] }} Vocab
                    </ion-card-subtitle>
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
    props: ['count', 'box', 'navigate'],
    data() {
        return {
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
        };
    },
});
</script>

<style scoped>
.opened-box-icon {
    max-width: 80%;
}

@media only screen and (min-device-width: 480px) {
    .opened-box-icon {
        width: 20%;
    }
}
</style>
