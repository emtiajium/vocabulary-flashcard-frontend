<template>
    <ion-page>
        <firecracker-header header-title="My Flashcards" content-id="leitner-boxes" menu-id="leitner-boxes-menu" />
        <ion-content :fullscreen="true" id="leitner-boxes">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <ion-card :button="true" class="margin-top-bottom-unset" @click="toggle">
                        <ion-card-content>
                            <ion-card-subtitle>
                                Remembering new vocabulary can be challenging, especially over time. The Leitner System
                                makes it easier by helping you review words at the right intervals.
                            </ion-card-subtitle>
                            <ion-card-subtitle v-show="seeLess" class="see-less">
                                ... <span> See More </span>
                            </ion-card-subtitle>
                            <ion-card-subtitle v-show="!seeLess" class="see-more ion-padding-top">
                                The Leitner System was developed by Sebastian Leitner, a German journalist. It uses a
                                technique called spaced repetition, where you review words at increasing intervals to
                                help you remember them for longer.
                            </ion-card-subtitle>
                            <leitner-systems-flow v-show="!seeLess" class="see-more" @click.stop />
                            <ion-card-subtitle v-show="!seeLess" class="see-more">
                                <p>
                                    The Leitner System uses five boxes to organise your flashcards based on how well you
                                    remember them.
                                </p>
                                <p>
                                    Start by placing a new word in Box 1. Review it according to the schedule shown for
                                    each box.
                                </p>
                                <p>
                                    If you remember the word, move it to the next box. If you forget it, move it back to
                                    the previous box. Words in Box 1 stay there until you remember them.
                                </p>
                                <p>
                                    As you move through the boxes, the time between reviews increases. This helps you
                                    focus more on difficult words while reviewing familiar ones less often.
                                </p>
                                <p>
                                    Once a word reaches Box 5, you've mastered it! You can still review it whenever you
                                    like.
                                </p>
                            </ion-card-subtitle>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>

            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="1" :count="count[1]" :error="error[1]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="2" :count="count[2]" :error="error[2]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="3" :count="count[3]" :error="error[3]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="4" :count="count[4]" :error="error[4]" />
                </ion-col>
                <ion-col sizeXs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
                    <leitner-single-box :box="5" :count="count[5]" :error="error[5]" />
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonPage, IonRow, IonCol, IonCardSubtitle, IonCardContent, IonCard } from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import LeitnerSingleBox from '@/views/leitner-systems/LeitnerSingleBox.vue';
import LeitnerSystemsFlow from '@/views/leitner-systems/LeitnerSystemsFlow.vue';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';

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
            error: [false, false, false, false, false, false] as boolean[],
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

        countBoxItem(box: number): Promise<number> {
            return HttpHandler.get<number>(`/v1/leitner-systems/items/count/${box}`);
        },

        async countBoxesItem(): Promise<void> {
            let lastError: Error = new Error();

            await Promise.all(
                this.placeholderItems.map((box) => {
                    return this.countBoxItem(box)
                        .then((count) => {
                            this.count[box] = count;
                            this.error[box] = false;
                        })
                        .catch((error) => {
                            this.count[box] = -1;
                            this.error[box] = true;
                            lastError = error;
                        });
                }),
            ).catch();

            if (lastError.message) {
                await Toast.present(lastError.message);
            }
        },

        clean(): void {
            this.count = [-1, -1, -1, -1, -1, -1];
            this.error = [false, false, false, false, false, false];
        },
    },
});
</script>

<style scoped>
@media only screen and (min-width: 768px) {
    .see-more {
        display: flex !important;
    }
    .see-less {
        display: none !important;
    }
}
.see-less > span {
    color: var(--ion-color-primary);
    font-weight: var(--font-weight-semibold);
}
</style>
