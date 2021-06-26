<template>
    <!--tried with routing, but could not find a way to set the definition before navigating back to this page-->
    <ion-page v-bind="$attrs" v-if="!isInDefinition()">
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>{{ headerTitle }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <spinner v-if="isLoading" v-show="isLoading" />

            <ion-card v-if="!isLoading" v-show="!isLoading">
                <ion-item lines="none">
                    <ion-label>Word</ion-label>
                </ion-item>
                <ion-item>
                    <ion-input type="text" :value="word" @keyup="setWord($event.target.value)"></ion-input>
                </ion-item>

                <ion-item lines="none">
                    <ion-label>Definition</ion-label>
                </ion-item>
                <ion-item v-if="!isLoading">
                    <ion-button color="success" @click="onAddingDefinition">{{
                        getAddButtonLabel(definitions.length)
                    }}</ion-button>
                </ion-item>

                <view v-if="!isLoading">
                    <view v-show="definitions.length" v-for="(definition, index) in definitions" :key="definition.id">
                        <ion-item lines="none">
                            <ion-label color="dark" class="ion-text-capitalize ion-text-nowrap">{{
                                definition.meaning
                            }}</ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-item-group>
                                <ion-button color="warning" @click="updateDefinition(index)">Edit</ion-button>
                                <ion-button color="danger" @click="removeDefinition(index)">Remove</ion-button>
                            </ion-item-group>
                        </ion-item>
                    </view>
                </view>

                <view v-if="isInCreationMode()">
                    <add-linker-words ref="AddLinkerWordsRef" />
                    <add-generic-notes ref="AddGenericNotesRef" />
                    <add-generic-external-links ref="AddGenericExternalLinksRef" />
                </view>

                <view v-if="isInUpdateMode()">
                    <add-linker-words ref="AddLinkerWordsRef" :existingLinkerWords="linkerWords" />
                    <add-generic-notes ref="AddGenericNotesRef" :existingGenericNotes="genericNotes" />
                    <add-generic-external-links
                        ref="AddGenericExternalLinksRef"
                        :existingGenericExternalLinks="genericExternalLinks"
                    />
                </view>

                <ion-item lines="none">
                    <ion-label>Is Draft</ion-label>
                </ion-item>
                <ion-item lines="none">
                    <ion-toggle :checked="isDraft" @ionChange="setIsDraft($event.target.checked)"></ion-toggle>
                </ion-item>

                <ion-grid>
                    <ion-row>
                        <ion-col size="6">
                            <ion-button color="warning" expand="block" @click="back()">Cancel</ion-button>
                        </ion-col>
                        <ion-col size="6">
                            <ion-button color="success" expand="block" @click="persist">Save</ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-card>
        </ion-content>
    </ion-page>

    <!--https://v3.vuejs.org/guide/component-attrs.html#disabling-attribute-inheritance-->
    <ion-page v-bind="$attrs" v-if="isInDefinition()">
        <view v-if="!isInDefinitionUpdateMode()">
            <add-definition
                :word="word"
                :vocabularyId="id"
                :afterAddingDefinition="afterAddingDefinition"
                :onCancellingAddingDefinition="onCancellingAddingDefinition"
            />
        </view>
        <view v-if="isInDefinitionUpdateMode()">
            <add-definition
                :word="word"
                :vocabularyId="id"
                :definition="goingToBeUpdatedDefinition"
                :afterAddingDefinition="afterUpdatingDefinition"
                :onCancellingAddingDefinition="onCancellingAddingDefinition"
            />
        </view>
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
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
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
import { useRoute } from 'vue-router';
import Spinner from '@/views/Spinner.vue';

enum PageType {
    ADD_VOCABULARY = 'ADD_VOCABULARY',
    ADD_DEFINITION = 'ADD_DEFINITION',
}

enum Mode {
    VOCABULARY_CREATE = 'VOCABULARY_CREATE',
    VOCABULARY_UPDATE = 'VOCABULARY_UPDATE',
    DEFINITION_CREATE = 'DEFINITION_CREATE',
    DEFINITION_UPDATE = 'DEFINITION_UPDATE',
}

export default defineComponent({
    name: 'AddVocabulary',
    components: {
        Spinner,
        AddDefinition,
        AddLinkerWords,
        AddGenericNotes,
        AddGenericExternalLinks,
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
        IonCard,
        IonGrid,
        IonRow,
        IonCol,
    },
    data() {
        return {
            isLoading: true,
            mode: '',
            headerTitle: '',
            id: uuidV4(),
            word: '',
            linkerWords: [] as string[],
            genericNotes: [] as string[],
            genericExternalLinks: [] as string[],
            isDraft: false,
            definitions: [] as Definition[],
            currentPage: PageType.ADD_VOCABULARY,
            goingToBeUpdatedDefinition: {} as Definition,
        };
    },
    async mounted() {
        const routeParameters = useRoute().params;
        if (routeParameters?.id) {
            this.headerTitle = 'Edit Vocabulary';
            await this.getAndSetExistingVocabulary(routeParameters.id as string);
            this.mode = Mode.VOCABULARY_UPDATE;
            this.isLoading = false;
        } else {
            this.headerTitle = 'Add Vocabulary';
            this.mode = Mode.VOCABULARY_CREATE;
            this.isLoading = false;
        }
    },
    methods: {
        async getAndSetExistingVocabulary(vocabularyId: string) {
            const vocabulary = (await HttpHandler.get<Vocabulary>(`/v1/vocabularies/${vocabularyId}`)) as Vocabulary;
            this.id = vocabulary.id;
            this.word = vocabulary.word;
            this.definitions = vocabulary.definitions as Definition[];
            this.linkerWords = vocabulary.linkerWords as string[];
            this.genericNotes = vocabulary.genericNotes as string[];
            this.genericExternalLinks = vocabulary.genericExternalLinks as string[];
            this.isDraft = vocabulary.isDraft;
        },
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
        isInDefinitionCreationMode() {
            return this.mode === Mode.DEFINITION_CREATE;
        },
        isInDefinitionUpdateMode() {
            return this.mode === Mode.DEFINITION_UPDATE;
        },
        isInCreationMode() {
            return this.mode === Mode.VOCABULARY_CREATE || this.isInDefinitionCreationMode();
        },
        isInUpdateMode() {
            return this.mode === Mode.VOCABULARY_UPDATE || this.isInDefinitionUpdateMode();
        },
        afterAddingDefinition(definition: Definition) {
            this.insertDefinition(definition);
            this.setCurrentPage(PageType.ADD_VOCABULARY);
        },
        afterUpdatingDefinition(definition: Definition) {
            this.definitions[this.definitions.findIndex(({ id }) => definition.id === id)] = definition as Definition;
            this.setCurrentPage(PageType.ADD_VOCABULARY);
        },
        onCancellingAddingDefinition() {
            this.setCurrentPage(PageType.ADD_VOCABULARY);
        },
        insertDefinition(definition: Definition) {
            this.definitions.push(definition);
            this.mode = Mode.DEFINITION_CREATE;
        },
        removeDefinition(removableIndex: number) {
            this.definitions = this.definitions.filter((definition, index) => index !== removableIndex);
        },
        setGoingToBeUpdatedDefinition(updatableIndex: number) {
            this.goingToBeUpdatedDefinition = this.definitions.find(
                (definition, index) => index === updatableIndex,
            ) as Definition;
        },
        updateDefinition(updatableIndex: number) {
            this.setGoingToBeUpdatedDefinition(updatableIndex);
            this.mode = Mode.DEFINITION_UPDATE;
            this.setCurrentPage(PageType.ADD_DEFINITION);
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
                await this.$router.replace(`/vocabularies`);
            } catch (error) {
                await Toast.present(error.message);
            }
        },
        clear() {
            this.id = uuidV4();
            this.word = '';
            this.isDraft = false;
            this.definitions = [] as Definition[];
            this.currentPage = PageType.ADD_VOCABULARY;
            this.goingToBeUpdatedDefinition = {} as Definition;
            (this.$refs.AddLinkerWordsRef as InstanceType<typeof AddLinkerWords>).clear();
            (this.$refs.AddGenericNotesRef as InstanceType<typeof AddGenericNotes>).clear();
            (this.$refs.AddGenericExternalLinksRef as InstanceType<typeof AddGenericExternalLinks>).clear();
        },
        back() {
            this.clear();
            this.$router.back();
        },
    },
});
</script>

<style scoped></style>
