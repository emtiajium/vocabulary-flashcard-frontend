<template>
    <ion-card button="true">
        <ion-card-header>
            <ion-card-title class="capitalize">{{ vocabulary.word }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-item v-if="!vocabulary.definitions.length" lines="none">
                <ion-card-subtitle> No definition has been added yet! </ion-card-subtitle>
            </ion-item>
            <view v-if="vocabulary.definitions.length">
                <view v-for="definition in vocabulary.definitions.slice(0, 2)" :key="definition.id">
                    <ion-item lines="none">
                        <ion-label class="capitalize">{{ definition.meaning }}</ion-label>
                    </ion-item>
                </view>
            </view>

            <ion-item v-if="vocabulary.definitions.length > 2" lines="none">
                <ion-card-subtitle>... ...</ion-card-subtitle>
            </ion-item>

            <ion-item lines="none">
                <ion-button color="success" @click="seeMore(vocabulary.id, vocabulary.word)">
                    <font-awesome-icon :icon="faExpandAlt" />
                </ion-button>
                <ion-button color="warning" @click="$router.push(`/edit-vocabulary/${vocabulary.id}`)">
                    <font-awesome-icon :icon="faEdit" />
                </ion-button>
                <ion-button color="danger" @click="presentAlertConfirm(vocabulary)">
                    <font-awesome-icon :icon="faTrashAlt" />
                </ion-button>
            </ion-item>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonItem,
    IonLabel,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrashAlt, faEdit, faExpandAlt } from '@fortawesome/free-solid-svg-icons';
import Alert from '@/utils/Alert';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import Toast from '@/utils/Toast';

export default defineComponent({
    name: 'MinifiedVocabulary',
    components: {
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonButton,
        FontAwesomeIcon,
        IonItem,
        IonLabel,
    },
    props: ['vocabulary', 'deleteVocabulary'],
    data() {
        return { faTrashAlt, faEdit, faExpandAlt };
    },
    methods: {
        async seeMore(id: string, word: string) {
            await this.$router.push(`/vocabulary/${id}/${word}`);
        },
        async presentAlertConfirm(vocabulary: Vocabulary) {
            await Alert.presentAlertConfirm('', `Are you sure you want to remove "${vocabulary.word}"?`, async () => {
                return HttpHandler.delete(`/v1/vocabularies/${vocabulary.id}`)
                    .then(() => this.deleteVocabulary(vocabulary.id))
                    .catch((error) => Toast.present(error.message));
            });
        },
    },
});
</script>

<style scoped></style>
