<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>Add Vocabulary</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-item lines="none">
                <ion-label>Word</ion-label>
            </ion-item>
            <ion-item>
                <ion-input type="text" :value="word" @keyup="setWord($event.target.value)"></ion-input>
            </ion-item>

            <add-linker-words ref="AddLinkerWordsRef" />

            <add-generic-notes ref="AddGenericNotes" />

            <add-generic-external-links ref="AddGenericExternalLinks" />

            <ion-item lines="none">
                <ion-label>Is Draft</ion-label>
            </ion-item>
            <ion-item>
                <ion-toggle :checked="isDraft" @ionChange="setIsDraft($event.target.checked)"></ion-toggle>
            </ion-item>

            <ion-button expand="block" @click="persist">Save</ion-button>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonTitle,
    IonToggle,
    IonToolbar,
    IonButton,
} from '@ionic/vue';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import Vocabulary from '@/domains/Vocabulary';
import { v4 as uuidV4 } from 'uuid';
import NativeStorage from '@/utils/NativeStorage';
import AddLinkerWords from '@/views/AddLinkerWords.vue';
import AddGenericNotes from '@/views/AddGenericNotes.vue';
import AddGenericExternalLinks from '@/views/AddGenericExternalLinks.vue';

export default defineComponent({
    name: 'AddVocabulary',
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonInput,
        IonLabel,
        IonItem,
        IonToggle,
        IonButton,
        AddLinkerWords,
        AddGenericNotes,
        AddGenericExternalLinks,
    },
    data() {
        return {
            id: uuidV4(),
            word: '',
            isDraft: true,
        };
    },
    methods: {
        setWord(word: string) {
            this.word = word;
        },
        setIsDraft(isDraft: boolean) {
            this.isDraft = isDraft;
        },
        async generatePayload() {
            const vocabulary = new Vocabulary();
            vocabulary.id = this.id;
            vocabulary.cohortId = await NativeStorage.getCohortId();
            vocabulary.word = this.word;
            vocabulary.linkerWords = (
                this.$refs.AddLinkerWordsRef as InstanceType<typeof AddLinkerWords>
            ).getLinkerWords();
            vocabulary.genericNotes = (
                this.$refs.AddGenericNotes as InstanceType<typeof AddGenericNotes>
            ).getGenericNotes();
            vocabulary.genericExternalLinks = (
                this.$refs.AddGenericExternalLinks as InstanceType<typeof AddGenericExternalLinks>
            ).getGenericExternalLinks();
            vocabulary.isDraft = this.isDraft;
            return vocabulary;
        },
        async persist() {
            try {
                const vocabulary = await this.generatePayload();
                await HttpHandler.post<Vocabulary, Vocabulary>(`/v1/vocabularies`, vocabulary);
            } catch (error) {
                await Toast.present(error.message);
            }
        },
    },
});
</script>

<style scoped></style>
