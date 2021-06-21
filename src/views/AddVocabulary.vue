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

            <ion-item lines="none">
                <ion-label>Linker Words</ion-label>
            </ion-item>
            <div v-for="(item, index) in itemsInLinkerWords" :key="index">
                <ion-item>
                    <ion-input
                        type="text"
                        :value="linkerWords[index] || ''"
                        @keyup="insertLinkerWord($event.target.value, index)"
                    ></ion-input>
                    <ion-button v-show="index === itemsInLinkerWords.length - 1" @click="onAddMoreLinkerWord"
                        >Add More</ion-button
                    >
                    <ion-button v-show="index === itemsInLinkerWords.length - 1" @click="onRemoveLastLinkerWord(index)"
                        >Remove</ion-button
                    >
                </ion-item>
            </div>

            <ion-item lines="none">
                <ion-label>Generic Notes</ion-label>
            </ion-item>
            <div v-for="(item, index) in itemsInGenericNotes" :key="index">
                <ion-item>
                    <ion-input
                        type="text"
                        :value="genericNotes[index] || ''"
                        @keyup="insertGenericNote($event.target.value, index)"
                    ></ion-input>
                    <ion-button v-show="index === itemsInGenericNotes.length - 1" @click="onAddMoreGenericNote"
                        >Add More</ion-button
                    >
                    <ion-button
                        v-show="index === itemsInGenericNotes.length - 1"
                        @click="onRemoveLastGenericNote(index)"
                        >Remove</ion-button
                    >
                </ion-item>
            </div>

            <ion-item lines="none">
                <ion-label>Generic External Links</ion-label>
            </ion-item>
            <div v-for="(item, index) in itemsInGenericExternalLinks" :key="index">
                <ion-item>
                    <ion-input
                        type="url"
                        :value="genericExternalLinks[index] || ''"
                        @keyup="insertGenericExternalLink($event.target.value, index)"
                    ></ion-input>
                    <ion-button
                        v-show="index === itemsInGenericExternalLinks.length - 1"
                        @click="onAddMoreGenericExternalLink"
                        >Add More</ion-button
                    >
                    <ion-button
                        v-show="index === itemsInGenericExternalLinks.length - 1"
                        @click="onRemoveLastGenericExternalLink(index)"
                        >Remove</ion-button
                    >
                </ion-item>
            </div>

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
    },
    data() {
        return {
            id: uuidV4(),
            word: '',
            isDraft: true,
            itemsInLinkerWords: [uuidV4()],
            linkerWords: [] as string[],
            itemsInGenericNotes: [uuidV4()],
            genericNotes: [] as string[],
            itemsInGenericExternalLinks: [uuidV4()],
            genericExternalLinks: [] as string[],
        };
    },
    methods: {
        setWord(word: string) {
            this.word = word;
        },
        setIsDraft(isDraft: boolean) {
            this.isDraft = isDraft;
        },
        insertLinkerWord(linkerWord: string, index: number) {
            this.linkerWords[index] = linkerWord;
        },
        onAddMoreLinkerWord() {
            this.itemsInLinkerWords.push(uuidV4());
        },
        onRemoveLastLinkerWord(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInLinkerWords.pop();
            }
            this.linkerWords = this.linkerWords.filter((linkerWord, index) => index !== removableIndex);
        },
        insertGenericNote(genericNote: string, index: number) {
            this.genericNotes[index] = genericNote;
        },
        onAddMoreGenericNote() {
            this.itemsInGenericNotes.push(uuidV4());
        },
        onRemoveLastGenericNote(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInGenericNotes.pop();
            }
            this.genericNotes = this.genericNotes.filter((genericNote, index) => index !== removableIndex);
        },
        insertGenericExternalLink(genericExternalLink: string, index: number) {
            this.genericExternalLinks[index] = genericExternalLink;
        },
        onAddMoreGenericExternalLink() {
            this.itemsInGenericExternalLinks.push(uuidV4());
        },
        onRemoveLastGenericExternalLink(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInGenericExternalLinks.pop();
            }
            this.genericExternalLinks = this.genericExternalLinks.filter(
                (genericExternalLink, index) => index !== removableIndex,
            );
        },
        async generatePayload() {
            const vocabulary = new Vocabulary();
            vocabulary.id = this.id;
            vocabulary.cohortId = await NativeStorage.getCohortId();
            vocabulary.word = this.word;
            vocabulary.linkerWords = this.linkerWords;
            vocabulary.genericNotes = this.genericNotes;
            vocabulary.genericExternalLinks = this.genericExternalLinks;
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
