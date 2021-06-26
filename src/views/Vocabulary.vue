<template>
    <ion-card button="true">
        <ion-card-header>
            <ion-grid>
                <ion-row>
                    <ion-col size="8">
                        <ion-card-title class="ion-text-capitalize">{{ vocabulary.word }}</ion-card-title>
                    </ion-col>
                    <ion-col size="4">
                        <ion-row class="ion-justify-content-end">
                            <ion-button color="warning" @click="$router.push(`/edit-vocabulary/${vocabulary.id}`)">
                                <font-awesome-icon :icon="faEdit" />
                            </ion-button>
                            <ion-button color="danger">
                                <font-awesome-icon :icon="faTrashAlt" />
                            </ion-button>
                        </ion-row>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card-header>

        <ion-card-content @click="seeMore">
            <view v-for="definition in vocabulary.definitions.slice(0, 2)" :key="definition.id">
                <ion-item lines="none">
                    <ion-label class="ion-text-capitalize">{{ definition.meaning }}</ion-label>
                </ion-item>
            </view>
            <view v-if="vocabulary.definitions.length > 2">
                <ion-item lines="none">
                    <ion-label>... ...</ion-label>
                </ion-item>
            </view>
            <ion-item lines="none">
                <ion-label>View details!</ion-label>
            </ion-item>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonItem,
    IonLabel,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'Vocabulary',
    components: {
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonGrid,
        IonRow,
        IonCol,
        IonButton,
        FontAwesomeIcon,
        IonItem,
        IonLabel,
    },
    props: ['vocabulary'],
    data() {
        return { faTrashAlt, faEdit };
    },
    methods: {
        seeMore() {
            console.log('See more!');
        },
    },
});
</script>

<style scoped></style>
