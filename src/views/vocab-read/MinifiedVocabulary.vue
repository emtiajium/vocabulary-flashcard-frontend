<template>
    <ion-card :button="true" class="margin-top-bottom-unset">
        <ion-row>
            <div
                class="contents"
                tabindex="0"
                role="button"
                @click="seeMore(vocabulary.id, vocabulary.word)"
                @keydown="onKeyDown($event, vocabulary.id, vocabulary.word)"
            >
                <ion-card-header>
                    <ion-card-title class="capitalize overflowed-content"> {{ vocabulary.word }} </ion-card-title>
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
            </div>

            <div class="action-buttons">
                <ion-row>
                    <ion-button
                        aria-label="Remove vocabulary"
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
                        aria-label="Update vocabulary"
                        fill="outline"
                        size="small"
                        shape="round"
                        :strong="true"
                        color="primary"
                        @click="$router.push(`/vocabulary/update/${vocabulary.id}`)"
                    >
                        <font-awesome-icon :icon="faPencilAlt" />
                    </ion-button>
                </ion-row>
                <ion-row style="flex-wrap: unset">
                    <ion-button
                        aria-label="Create flashcard"
                        fill="clear"
                        size="small"
                        shape="round"
                        :strong="true"
                        :disabled="disableBoxInsertionButton"
                        color="fern-green"
                        @click="insertIntoLeitnerBox"
                    >
                        <font-awesome-icon
                            :icon="vocabulary.isInLeitnerBox ? faHeartSolid : faHeartRegular"
                            class="leitner-icon"
                        />
                    </ion-button>
                    <ion-button
                        aria-label="View vocabulary details"
                        fill="outline"
                        size="small"
                        shape="round"
                        :strong="true"
                        color="fern-green"
                        @click="seeMore(vocabulary.id, vocabulary.word)"
                    >
                        <font-awesome-icon :icon="faExpandAlt" />
                    </ion-button>
                </ion-row>
            </div>
        </ion-row>
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
    IonRow,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faTrashAlt,
    faPencilAlt,
    faExpandAlt,
    faEllipsisH,
    faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import Alert from '@/utils/Alert';
import HttpHandler from '@/utils/HttpHandler';
import Vocabulary from '@/domains/Vocabulary';
import Toast from '@/utils/Toast';
import LeitnerSystemService from '@/utils/LeitnerSystemService';

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
        IonRow,
    },
    props: ['vocabulary', 'deleteVocabulary', 'updateLeitnerBoxExistence'],
    data() {
        return {
            faTrashAlt,
            faPencilAlt,
            faExpandAlt,
            faEllipsisH,
            faHeartSolid,
            faHeartRegular,
            disableBoxInsertionButton: false,
        };
    },
    methods: {
        async seeMore(id: string, word: string): Promise<void> {
            await this.$router.push(`/vocabulary/read/${id}/${word}/${false}`);
        },
        async onKeyDown(keyboardEvent: KeyboardEvent, id: string, word: string): Promise<void> {
            if (keyboardEvent.code === 'Enter' || keyboardEvent.key === 'Enter') {
                await this.seeMore(id, word);
            }
        },
        async presentAlertConfirm(vocabulary: Vocabulary): Promise<void> {
            await Alert.presentAlertConfirm('', `Are you sure you want to remove "${vocabulary.word}"?`, async () => {
                return HttpHandler.delete(`/v1/vocabularies/${vocabulary.id}`)
                    .then(() => this.deleteVocabulary(vocabulary.id))
                    .catch((error) => Toast.present(error.message));
            });
        },
        async insertIntoLeitnerBox(): Promise<void> {
            this.disableBoxInsertionButton = true;
            await LeitnerSystemService.insertIntoLeitnerBox(this.vocabulary.id);
            this.disableBoxInsertionButton = false;
            this.updateLeitnerBoxExistence(this.vocabulary.id);
        },
    },
});
</script>

<style scoped>
.contents {
    width: calc(100% - 120px);
}
.action-buttons {
    width: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: flex-end;
    padding-inline: var(--ion-padding);
}
.leitner-icon {
    font-size: 24px;
}
</style>
