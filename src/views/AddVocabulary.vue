<template>
    <!--tried with routing, but could not find a way to set the definition before navigating back to this page-->
    <ion-page v-show="!isInDefinition()">
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
                <ion-label>Definition</ion-label>
            </ion-item>
            <ion-item>
                <ion-button color="success" @click="onAddingDefinition">{{
                    getAddButtonLabel(definitions.length)
                }}</ion-button>
            </ion-item>
            <div v-show="definitions.length" v-for="(definition, index) in definitions" :key="definition.id">
                <ion-item>
                    <ion-item-group>
                        <ion-button color="dark">{{ `${definition.meaning.slice(0, 5)} ...` }}</ion-button>
                        <ion-button color="warning">Edit</ion-button>
                        <ion-button color="danger" @click="removeDefinition(index)">Remove</ion-button>
                    </ion-item-group>
                </ion-item>
            </div>

            <add-linker-words ref="AddLinkerWordsRef" />

            <add-generic-notes ref="AddGenericNotesRef" />

            <add-generic-external-links ref="AddGenericExternalLinksRef" />

            <ion-item lines="none">
                <ion-label>Is Draft</ion-label>
            </ion-item>
            <ion-item>
                <ion-toggle :checked="isDraft" @ionChange="setIsDraft($event.target.checked)"></ion-toggle>
            </ion-item>

            <ion-button expand="block" @click="persist">Save</ion-button>
        </ion-content>
    </ion-page>

    <!--https://v3.vuejs.org/guide/component-attrs.html#disabling-attribute-inheritance-->
    <ion-page v-bind="$attrs" v-show="isInDefinition()">
        <add-definition :word="word" :vocabularyId="id" :afterAddingDefinition="afterAddingDefinition" />
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
    IonItemGroup,
} from '@ionic/vue';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import Vocabulary from '@/domains/Vocabulary';
import { v4 as uuidV4 } from 'uuid';
import NativeStorage from '@/utils/NativeStorage';
import AddLinkerWords from '@/views/AddLinkerWords.vue';
import AddGenericNotes from '@/views/AddGenericNotes.vue';
import AddGenericExternalLinks from '@/views/AddGenericExternalLinks.vue';
import Definition from '@/domains/Definition';
import AddDefinition from '@/views/AddDefinition.vue';
import { validateSync } from 'class-validator';
import ValidationErrorTransform from '@/utils/ValidationErrorTransform';

enum PageType {
    ADD_VOCABULARY = 'ADD_VOCABULARY',
    ADD_DEFINITION = 'ADD_DEFINITION',
}

export default defineComponent({
    name: 'AddVocabulary',
    components: {
        AddDefinition,
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
        IonItemGroup,
        AddLinkerWords,
        AddGenericNotes,
        AddGenericExternalLinks,
    },
    data() {
        return {
            id: uuidV4(),
            word: '',
            isDraft: true,
            definitions: [] as Definition[],
            currentPage: PageType.ADD_VOCABULARY,
        };
    },
    methods: {
        getAddButtonLabel(itemsLength: number) {
            return itemsLength ? 'Add More' : 'Add';
        },
        setWord(word: string) {
            this.word = word.trim();
        },
        setIsDraft(isDraft: boolean) {
            this.isDraft = isDraft;
        },
        async onAddingDefinition() {
            if (!this.word) {
                await Toast.present(`Please insert the word before adding the definition`);
            } else {
                this.setCurrentPage(PageType.ADD_DEFINITION);
            }
        },
        setCurrentPage(currentPage: PageType) {
            this.currentPage = currentPage;
        },
        isInDefinition() {
            return this.currentPage === PageType.ADD_DEFINITION;
        },
        afterAddingDefinition(definition: Definition) {
            this.insertDefinition(definition);
            this.setCurrentPage(PageType.ADD_VOCABULARY);
        },
        insertDefinition(definition: Definition) {
            this.definitions.push(definition);
        },
        removeDefinition(removableIndex: number) {
            this.definitions = this.definitions.filter((definition, index) => index !== removableIndex);
        },
        async getVocabularyPayload() {
            const vocabulary = new Vocabulary();
            vocabulary.id = this.id;
            vocabulary.cohortId = await NativeStorage.getCohortId();
            vocabulary.word = this.word;
            vocabulary.definitions = this.definitions;
            vocabulary.linkerWords = (
                this.$refs.AddLinkerWordsRef as InstanceType<typeof AddLinkerWords>
            ).getLinkerWords();
            vocabulary.genericNotes = (
                this.$refs.AddGenericNotesRef as InstanceType<typeof AddGenericNotes>
            ).getGenericNotes();
            vocabulary.genericExternalLinks = (
                this.$refs.AddGenericExternalLinksRef as InstanceType<typeof AddGenericExternalLinks>
            ).getGenericExternalLinks();
            vocabulary.isDraft = this.isDraft;
            return vocabulary;
        },
        validatePayload(vocabulary: Vocabulary) {
            const errors = validateSync(vocabulary);
            if (errors.length > 0) {
                throw new Error(ValidationErrorTransform.transform(errors)[0]);
            }
        },
        async persist() {
            try {
                const vocabulary = await this.getVocabularyPayload();
                this.validatePayload(vocabulary);
                await HttpHandler.post<Vocabulary, Vocabulary>(`/v1/vocabularies`, vocabulary);
                this.clear();
                // await this.$router.back();
            } catch (error) {
                await Toast.present(error.message);
            }
        },
        clear() {
            this.id = uuidV4();
            this.word = '';
            this.isDraft = true;
            this.definitions = [] as Definition[];
            this.currentPage = PageType.ADD_VOCABULARY;
            (this.$refs.AddLinkerWordsRef as InstanceType<typeof AddLinkerWords>).clear();
            (this.$refs.AddGenericNotesRef as InstanceType<typeof AddGenericNotes>).clear();
            (this.$refs.AddGenericExternalLinksRef as InstanceType<typeof AddGenericExternalLinks>).clear();
        },
    },
});
</script>

<style scoped></style>
