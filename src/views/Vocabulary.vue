<template>
    <ion-card>
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

        <ion-card-content>
            Keep close to Nature's heart... and break clear away, once in awhile, and climb a mountain or spend a week
            in the woods. Wash your spirit clean.
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonButton } from '@ionic/vue';
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
    },
    props: ['vocabulary'],
    data() {
        return { faTrashAlt, faEdit };
    },
});
</script>

<style scoped></style>
