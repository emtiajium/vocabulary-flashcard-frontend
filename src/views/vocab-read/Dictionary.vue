<template>
    <view>
        <ion-card class="margin-top-unset">
            <ion-card-header class="label-block">
                <ion-card-title :class="getLabelClass()"> Definition in the renowned dictionary </ion-card-title>
            </ion-card-header>
        </ion-card>
        <ion-row class="display-flex ion-justify-content-center">
            <ion-col sizeXs="4" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="3">
                <ion-card
                    :button="true"
                    :href="`https://dictionary.cambridge.org/dictionary/english/${word.toLowerCase()}`"
                    target="_blank"
                    class="transparent"
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
            <ion-col sizeXs="4" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="3">
                <ion-card
                    :button="true"
                    :href="`https://www.merriam-webster.com/dictionary/${word.toLowerCase()}`"
                    target="_blank"
                    class="transparent"
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
            <ion-col sizeXs="4" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="3">
                <ion-card
                    :button="true"
                    :href="`https://www.oxfordlearnersdictionaries.com/definition/english/${word
                        .toLowerCase()
                        .replace(' ', '-')}_1?q=${word.toLowerCase().replace(' ', '+')}`"
                    target="_blank"
                    class="transparent"
                >
                    <ion-card-content class="display-flex ion-justify-content-center ion-padding">
                        <img src="/assets/icon/oxford.png" alt="Oxford Dictionary" class="dictionary-logo-extra" />
                    </ion-card-content>
                </ion-card>
            </ion-col>
        </ion-row>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardContent, IonRow, IonCol, IonCardTitle, IonCardHeader } from '@ionic/vue';

export default defineComponent({
    name: 'Dictionary',
    components: {
        IonCard,
        IonCardContent,
        IonRow,
        IonCol,
        IonCardTitle,
        IonCardHeader,
    },
    props: ['word', 'labelAlignment'],
    methods: {
        getLabelClass(): string {
            return this.labelAlignment === 'center' ? 'ion-text-center' : 'ion-text-left';
        },
    },
});
</script>

<style scoped>
.dictionary-logo-extra {
    border-radius: 50%;
    width: 80%;
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
    .dictionary-logo-extra {
        width: 80%;
    }
}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {
    .dictionary-logo-extra {
        width: 70%;
    }
}

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {
    .dictionary-logo-extra {
        width: 65%;
    }
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {
    .dictionary-logo-extra {
        width: 60%;
    }
}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {
    .dictionary-logo-extra {
        width: 40%;
    }
}

.label-block {
    padding-top: calc(var(--ion-padding) / 2);
    padding-bottom: calc(var(--ion-padding) / 2);
}
</style>
