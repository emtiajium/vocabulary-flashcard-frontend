<template>
    <view>
        <ion-card>
            <ion-card-header>
                <ion-card-title> Definition in the renowned dictionary </ion-card-title>
            </ion-card-header>
        </ion-card>
        <ion-grid>
            <ion-row>
                <ion-col size="4">
                    <ion-card
                        button="true"
                        :href="`https://dictionary.cambridge.org/dictionary/english/${word.toLowerCase()}`"
                        target="_blank"
                    >
                        <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                            <img
                                src="/assets/icon/cambridge.png"
                                alt="Cambridge Dictionary"
                                class="dictionary-logo-extra"
                            />
                        </ion-card-content>
                    </ion-card>
                </ion-col>
                <ion-col size="4">
                    <ion-card
                        button="true"
                        :href="`https://www.merriam-webster.com/dictionary/${word.toLowerCase()}`"
                        target="_blank"
                    >
                        <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                            <img
                                src="/assets/icon/merriam-webster.png"
                                alt="Merriam Webster Dictionary"
                                class="dictionary-logo-extra"
                            />
                        </ion-card-content>
                    </ion-card>
                </ion-col>
                <ion-col size="4">
                    <ion-card
                        button="true"
                        :href="`https://www.oxfordlearnersdictionaries.com/definition/english/${word.toLowerCase()}_1?q=${word.toLowerCase()}`"
                        target="_blank"
                    >
                        <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                            <img src="/assets/icon/oxford.png" alt="Oxford Dictionary" class="dictionary-logo-extra" />
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonCardTitle, IonCardHeader } from '@ionic/vue';

export default defineComponent({
    name: 'Dictionary',
    components: {
        IonCard,
        IonCardContent,
        IonGrid,
        IonRow,
        IonCol,
        IonCardTitle,
        IonCardHeader,
    },
    props: ['word'],
});
</script>

<style scoped>
.dictionary-logo-extra {
    width: 100%;
    border-radius: 50%;
}
@media only screen and (min-device-width: 480px) {
    .dictionary-logo-extra {
        width: 50%;
    }
}
</style>
