<template>
    <ion-card button="true">
        <ion-grid>
            <ion-row>
                <ion-col size="8" @click="seeMore(vocabulary.id, vocabulary.word)">
                    <ion-card-header>
                        <ion-card-title class="capitalize"> {{ vocabulary.word }} </ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <ion-card-subtitle v-if="!vocabulary.definitions.length">
                            No definition has been added yet!
                        </ion-card-subtitle>
                        <view v-if="vocabulary.definitions.length">
                            <view v-for="definition in vocabulary.definitions.slice(0, 2)" :key="definition.id">
                                <ion-label class="capitalize display-flow-root overflowed-content">
                                    {{ definition.meaning }}
                                </ion-label>
                            </view>
                        </view>

                        <ion-card-subtitle v-if="vocabulary.definitions.length > 2">
                            <font-awesome-icon :icon="faEllipsisH" />
                        </ion-card-subtitle>
                    </ion-card-content>
                </ion-col>

                <ion-col size="4" class="center">
                    <ion-button
                        fill="outline"
                        size="small"
                        shape="round"
                        :strong="true"
                        color="primary"
                        @click="$router.push(`/vocabulary/update/${vocabulary.id}`)"
                    >
                        <font-awesome-icon :icon="faPencilAlt" />
                    </ion-button>
                    <ion-button
                        fill="outline"
                        size="small"
                        shape="round"
                        :strong="true"
                        color="warning"
                        @click="presentAlertConfirm(vocabulary)"
                    >
                        <font-awesome-icon :icon="faTrashAlt" />
                    </ion-button>
                    <ion-button
                        fill="outline"
                        size="small"
                        shape="round"
                        :strong="true"
                        color="fern-green"
                        @click="seeMore(vocabulary.id, vocabulary.word)"
                    >
                        <font-awesome-icon :icon="faExpandAlt" />
                    </ion-button>
                </ion-col>
            </ion-row>
        </ion-grid>
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
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrashAlt, faPencilAlt, faExpandAlt, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
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
        IonLabel,
        IonGrid,
        IonRow,
        IonCol,
    },
    props: ['vocabulary', 'deleteVocabulary'],
    data() {
        return { faTrashAlt, faPencilAlt, faExpandAlt, faEllipsisH };
    },
    methods: {
        async seeMore(id: string, word: string): Promise<void> {
            await this.$router.push(`/vocabulary/read/${id}/${word}`);
        },
        async presentAlertConfirm(vocabulary: Vocabulary): Promise<void> {
            await Alert.presentAlertConfirm('', `Are you sure you want to remove "${vocabulary.word}"?`, async () => {
                return HttpHandler.delete(`/v1/vocabularies/${vocabulary.id}`)
                    .then(() => this.deleteVocabulary(vocabulary.id))
                    .catch((error) => Toast.present(error.message));
            });
        },
    },
});
</script>

<style scoped>
.center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
}
</style>
