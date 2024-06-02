<template>
    <!--tried with routing, but could not find a way to set the definition before navigating back to this page (without relying on the storage)-->
    <ion-page v-bind="$attrs" v-if="!isInDefinition()">
        <firecracker-header
            :header-title="headerTitle"
            content-id="add-vocabulary"
            menu-id="add-vocabulary-menu"
            type="MANUAL_BACK"
            :manual-back-icon-handler="back"
        />

        <ion-content :fullscreen="true" id="add-vocabulary">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <spinner v-if="isLoading" />

                    <view v-if="!isLoading">
                        <ion-card class="margin-top-unset">
                            <ion-card-header>
                                <ion-card-title> Word </ion-card-title>
                                <ion-card-subtitle class="tips">
                                    <span class="material-icons"> tips_and_updates </span>
                                    <span class="info">
                                        A word, an idiom, even a prepositional phrase and most importantly whatever you
                                        wish to insert
                                    </span>
                                </ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-item lines="none" class="vocab-upsert-item">
                                    <ion-textarea
                                        :auto-grow="true"
                                        inputmode="text"
                                        autocapitalize="sentences"
                                        placeholder="Type something"
                                        :value="word"
                                        @ionChange="setWord($event.detail.value as string)"
                                    />
                                </ion-item>
                            </ion-card-content>
                        </ion-card>

                        <ion-card>
                            <ion-card-header>
                                <ion-card-title> Definitions </ion-card-title>
                                <ion-card-subtitle class="tips">
                                    <span class="material-icons"> tips_and_updates </span>
                                    <span class="info"> An explanation of what a word means </span>
                                </ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content class="added-definition-card-content">
                                <div
                                    v-show="!isLoading && definitions.length"
                                    v-for="(definition, index) in definitions"
                                    :key="definition.id"
                                    class="added-definition-container"
                                >
                                    <div class="added-definition-action-buttons">
                                        <ion-button
                                            color="warning"
                                            size="small"
                                            shape="round"
                                            fill="clear"
                                            :strong="true"
                                            @click="removeDefinition(index)"
                                        >
                                            <font-awesome-icon :icon="faMinusCircle" />
                                        </ion-button>
                                        <ion-button
                                            color="success"
                                            size="small"
                                            shape="round"
                                            fill="clear"
                                            :strong="true"
                                            @click="updateDefinition(index)"
                                        >
                                            <font-awesome-icon :icon="faPencilAlt" />
                                        </ion-button>
                                    </div>
                                    <div class="added-definition-contents">
                                        <span class="overflowed-content capitalize">
                                            {{ definition.meaning }}
                                        </span>
                                    </div>
                                </div>
                            </ion-card-content>
                            <ion-card-content class="add-definition-button-container">
                                <ion-button
                                    v-if="!isLoading"
                                    color="success"
                                    size="large"
                                    shape="round"
                                    fill="clear"
                                    :strong="true"
                                    @click="onAddingDefinition"
                                >
                                    <font-awesome-icon v-if="!definitions.length" :icon="faPlusCircle" />
                                    <span v-if="definitions.length" class="material-icons add-more"> plus_one </span>
                                </ion-button>
                            </ion-card-content>
                        </ion-card>

                        <add-linker-words ref="AddLinkerWordsRef" :existing-linker-words="linkerWords" />
                        <add-generic-notes ref="AddGenericNotesRef" :existing-generic-notes="genericNotes" />
                        <add-generic-external-links
                            ref="AddGenericExternalLinksRef"
                            :existing-generic-external-links="genericExternalLinks"
                        />

                        <ion-card>
                            <ion-card-header>
                                <ion-card-title> Draft </ion-card-title>
                                <ion-card-subtitle class="tips">
                                    <span class="material-icons"> tips_and_updates </span>
                                    <span class="info">
                                        It is possible to save a vocabulary without a definition in draft mode
                                    </span>
                                </ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-toggle
                                    class="draft-toggle"
                                    area-label="Save the vocabulary as draft"
                                    :checked="isDraft"
                                    @ionChange="setIsDraft($event.target.checked)"
                                />
                            </ion-card-content>
                        </ion-card>

                        <ion-row class="buttons-container">
                            <ion-col
                                sizeXs="6"
                                sizeSm="4"
                                sizeMd="2"
                                sizeLg="2"
                                sizeXl="2"
                                class="cancel-button-container"
                            >
                                <ion-button
                                    fill="outline"
                                    color="warning"
                                    expand="block"
                                    class="cancel-button"
                                    @click="back"
                                >
                                    Cancel
                                </ion-button>
                            </ion-col>
                            <ion-col
                                sizeXs="6"
                                sizeSm="4"
                                sizeMd="2"
                                sizeLg="2"
                                sizeXl="2"
                                class="save-button-container"
                            >
                                <ion-button
                                    color="success"
                                    expand="block"
                                    class="save-button"
                                    :disabled="disableSaveButton"
                                    @click="persist"
                                >
                                    Save
                                </ion-button>
                            </ion-col>
                        </ion-row>
                    </view>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>

    <!--https://v3.vuejs.org/guide/component-attrs.html#disabling-attribute-inheritance-->
    <ion-page v-bind="$attrs" v-if="isInDefinition()">
        <add-definition
            :word="word"
            :vocabulary-id="id"
            :definition="goingToBeUpdatedDefinition"
            :on-coming-back-to-vocab="onComingBackToVocab"
            :on-cancelling-adding-definition="onCancellingAddingDefinition"
        />
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonContent,
    IonTextarea,
    IonItem,
    IonPage,
    IonToggle,
    IonButton,
    IonCard,
    IonRow,
    IonCol,
    IonCardTitle,
    IonCardSubtitle,
    IonCardHeader,
    IonCardContent,
    useBackButton,
} from '@ionic/vue';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import Vocabulary, { VocabularyExistenceResponse } from '@/domains/Vocabulary';
import { v4 as uuidV4 } from 'uuid';
import AddLinkerWords from '@/views/vocab-upsert/AddLinkerWords.vue';
import AddGenericNotes from '@/views/vocab-upsert/AddGenericNotes.vue';
import AddGenericExternalLinks from '@/views/vocab-upsert/AddGenericExternalLinks.vue';
import Definition from '@/domains/Definition';
import AddDefinition from '@/views/vocab-upsert/AddDefinition.vue';
import { validateSync } from 'class-validator';
import ValidationErrorTransform from '@/utils/ValidationErrorTransform';
import Spinner from '@/views/shared/Spinner.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlusCircle, faMinusCircle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import MessageDB from '@/utils/MessageDB';
import NativeStorage from '@/utils/NativeStorage';
import Alert from '@/utils/Alert';
import * as _ from 'lodash';
import { isArrayOfStringEqual, isArrayOfObjectEqual } from '@/utils/is-equal';
import BackButtonHandlerPriority from '@/domains/BackButtonHandlerPriority';
import { BackButtonUnsubscribeHandler, ProcessNextHandler } from '@/domains/Handlers';
import { FirecrackerError } from '@/domains/FirecrackerError';

enum PageType {
    VOCABULARY_CU = 'VOCABULARY_CU',
    DEFINITION_CU = 'DEFINITION_CU',
}

enum Mode {
    VOCABULARY_CREATE = 'VOCABULARY_CREATE',
    VOCABULARY_UPDATE = 'VOCABULARY_UPDATE',
}

export default defineComponent({
    name: 'AddVocabulary',
    components: {
        FirecrackerHeader,
        Spinner,
        AddDefinition,
        AddLinkerWords,
        AddGenericNotes,
        AddGenericExternalLinks,
        IonContent,
        IonPage,
        IonTextarea,
        IonItem,
        IonToggle,
        IonButton,
        IonCard,
        IonRow,
        IonCol,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        FontAwesomeIcon,
    },
    data() {
        return {
            isLoading: true,
            currentPage: PageType.VOCABULARY_CU,
            mode: '',
            headerTitle: '',
            id: uuidV4(),
            word: '',
            linkerWords: [] as string[],
            genericNotes: [] as string[],
            genericExternalLinks: [] as string[],
            isDraft: false,
            definitions: [] as Definition[],
            goingToBeUpdatedDefinition: {} as Definition,
            faPlusCircle,
            faMinusCircle,
            faPencilAlt,
            pristineVocabulary: {} as Vocabulary,
            backButtonUnsubscribeHandler: {} as BackButtonUnsubscribeHandler,
            disableSaveButton: false,
        };
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clear();
    },
    methods: {
        subscribeToHardwareBackButtonListener(): void {
            this.unsubscribeBackButtonListener();
            this.backButtonUnsubscribeHandler = useBackButton(
                BackButtonHandlerPriority.ADD_VOCABULARY,
                async (processNextHandler) => {
                    await this.notifyUnsavedVocabulary(() => {
                        processNextHandler();
                    });
                },
            );
        },
        async init(): Promise<void> {
            this.subscribeToHardwareBackButtonListener();
            this.isLoading = true;
            const routeParameters = this.$route.params;
            if (routeParameters?.id) {
                await this.loadEditView();
            } else {
                this.loadAddView();
            }
        },
        loadAddView(): void {
            this.headerTitle = 'Add Vocabulary';
            this.mode = Mode.VOCABULARY_CREATE;
            this.isLoading = false;
        },
        async loadEditView(): Promise<void> {
            this.headerTitle = 'Edit Vocabulary';
            await this.getAndSetExistingVocabulary(this.$route.params.id as string);
            this.mode = Mode.VOCABULARY_UPDATE;
            this.isLoading = false;
        },
        async getAndSetExistingVocabulary(vocabularyId: string): Promise<void> {
            try {
                const vocabulary = (await HttpHandler.get<Vocabulary>(
                    `/v1/vocabularies/${vocabularyId}`,
                )) as Vocabulary;
                this.pristineVocabulary = _.cloneDeep(vocabulary) as Vocabulary;
                this.id = vocabulary.id;
                this.word = vocabulary.word;
                this.definitions = vocabulary.definitions as Definition[];
                this.linkerWords = vocabulary.linkerWords as string[];
                this.genericNotes = vocabulary.genericNotes as string[];
                this.genericExternalLinks = vocabulary.genericExternalLinks as string[];
                this.isDraft = vocabulary.isDraft;
            } catch {
                await Promise.all([Toast.present(MessageDB.networkError), this.$router.back()]);
            }
        },
        setWord(word: string): void {
            this.word = word.trim();
        },
        setIsDraft(isDraft: boolean): void {
            this.isDraft = isDraft;
        },
        async navigateToExisting(existingVocabulary: VocabularyExistenceResponse): Promise<void> {
            await this.$router.replace(`/vocabulary/update/${existingVocabulary.id}`);
            // reset the form with new data
            // it doesn't happen automatically because in the edit mode
            // the route remains the same (just the param is different)
            // so, ionViewDidEnter() is not getting executed
            if (this.isInUpdateMode()) {
                await this.init();
            }
        },
        async notifyExistence(existingVocabulary: VocabularyExistenceResponse): Promise<void> {
            await Alert.presentAlertConfirm(
                '',
                `"${existingVocabulary.word}" already exists. Please consider updating it.`,
                async () => this.navigateToExisting(existingVocabulary),
                async () => Promise.resolve(),
                {
                    cancel: 'Cancel',
                    agree: 'Update',
                },
            );
        },
        async assertExistence(): Promise<boolean> {
            try {
                const vocabularyId = (this.$route.params.id || this.id) as string;
                const existingVocabulary = await HttpHandler.get<VocabularyExistenceResponse>(
                    `/v1/vocabularies/${vocabularyId}/assert-existence/words/${this.word}`,
                );
                if (!_.isEmpty(existingVocabulary)) {
                    await this.notifyExistence(existingVocabulary);
                    return true;
                }
                return false;
            } catch {
                // do nothing if an error is thrown by the server
                return false;
            }
        },
        async onAddingDefinition(): Promise<void> {
            if (!this.word) {
                await Toast.present(`Please add the word before adding the definition.`);
            } else {
                const isExists = await this.assertExistence();
                if (!isExists) {
                    this.setPartialPayload();
                    this.resetGoingToBeUpdatedDefinition();
                    this.setCurrentPage(PageType.DEFINITION_CU);
                }
            }
        },
        setCurrentPage(currentPage: PageType): void {
            this.currentPage = currentPage;
        },
        isInDefinition(): boolean {
            return this.currentPage === PageType.DEFINITION_CU;
        },
        isInCreationMode(): boolean {
            return this.mode === Mode.VOCABULARY_CREATE;
        },
        isInUpdateMode(): boolean {
            return this.mode === Mode.VOCABULARY_UPDATE;
        },
        onComingBackToVocab(definition: Definition): void {
            if (this.definitions.findIndex(({ id }) => definition.id === id) !== -1) {
                this.afterUpdatingDefinition(definition);
            } else {
                this.afterAddingDefinition(definition);
            }
            this.setCurrentPage(PageType.VOCABULARY_CU);
        },
        afterAddingDefinition(definition: Definition): void {
            this.insertDefinition(definition);
        },
        afterUpdatingDefinition(definition: Definition): void {
            this.definitions[this.definitions.findIndex(({ id }) => definition.id === id)] = definition as Definition;
        },
        onCancellingAddingDefinition(): void {
            this.setCurrentPage(PageType.VOCABULARY_CU);
        },
        insertDefinition(definition: Definition): void {
            this.definitions.push(definition);
        },
        removeDefinition(removableIndex: number): void {
            this.definitions = this.definitions.filter((definition, index) => index !== removableIndex);
        },
        setGoingToBeUpdatedDefinition(updatableIndex: number): void {
            this.goingToBeUpdatedDefinition = this.definitions.find(
                (definition, index) => index === updatableIndex,
            ) as Definition;
        },
        resetGoingToBeUpdatedDefinition(): void {
            this.goingToBeUpdatedDefinition = {} as Definition;
        },
        async updateDefinition(updatableIndex: number): Promise<void> {
            const isExists = await this.assertExistence();
            if (!isExists) {
                this.setPartialPayload();
                this.setGoingToBeUpdatedDefinition(updatableIndex);
                this.setCurrentPage(PageType.DEFINITION_CU);
            }
        },
        setPartialPayload(): void {
            this.linkerWords = (this.$refs.AddLinkerWordsRef as InstanceType<typeof AddLinkerWords>).getLinkerWords();
            this.genericNotes = (
                this.$refs.AddGenericNotesRef as InstanceType<typeof AddGenericNotes>
            ).getGenericNotes();
            this.genericExternalLinks = (
                this.$refs.AddGenericExternalLinksRef as InstanceType<typeof AddGenericExternalLinks>
            ).getGenericExternalLinks();
        },
        getVocabularyPayload(): Vocabulary {
            // a work-around to persist linker words, generic notes and generic links
            // when these 3 props have been added after navigating back from the definition view
            // or when this vocab doesn't have any definition
            this.setPartialPayload();
            const vocabulary = new Vocabulary();
            vocabulary.id = this.id;
            vocabulary.word = this.word;
            vocabulary.definitions = this.definitions;
            vocabulary.linkerWords = this.linkerWords;
            vocabulary.genericNotes = this.genericNotes;
            vocabulary.genericExternalLinks = this.genericExternalLinks;
            vocabulary.isDraft = this.isDraft;
            return vocabulary;
        },
        validatePayload(vocabulary: Vocabulary): void {
            const errors = validateSync(vocabulary);
            if (errors.length > 0) {
                throw new Error(ValidationErrorTransform.transform(errors)[0]);
            }
        },
        async persist(): Promise<void> {
            try {
                const vocabulary = this.getVocabularyPayload();
                this.validatePayload(vocabulary);
                this.disableSaveButton = true;
                const persistedVocabulary = await HttpHandler.post<Vocabulary, Vocabulary>(
                    `/v1/vocabularies`,
                    vocabulary,
                );
                this.clear();
                if (this.isInCreationMode()) {
                    await NativeStorage.setShouldReloadVocabularies(true);
                } else {
                    await Promise.all([
                        NativeStorage.setUpdatedVocabulary(_.cloneDeep(persistedVocabulary)),
                        persistedVocabulary.isInLeitnerBox
                            ? NativeStorage.setLeitnerBoxExistence(persistedVocabulary.id)
                            : Promise.resolve(),
                    ]);
                }
                this.$router.back();
            } catch (error) {
                await Toast.present((error as FirecrackerError).message);
            } finally {
                this.disableSaveButton = false;
            }
        },
        unsubscribeBackButtonListener(): void {
            if (!_.isEmpty(this.backButtonUnsubscribeHandler)) {
                this.backButtonUnsubscribeHandler.unregister();
            }
        },
        clear(): void {
            this.id = uuidV4();
            this.word = '';
            this.isDraft = false;
            this.definitions = [] as Definition[];
            this.linkerWords = [] as string[];
            this.genericNotes = [] as string[];
            this.genericExternalLinks = [] as string[];
            this.currentPage = PageType.VOCABULARY_CU;
            // Do not reset "mode"
            this.goingToBeUpdatedDefinition = {} as Definition;
            // add/edit vocab/definition pages are served by only one route
            // so when the user presses the browser provided back icon from the definition page
            // this component's ionViewWillLeave() gets called
            // but as at that moment <add-vocabulary /> doesn't exist at the DOM tree
            // below three clear methods throw error
            /* eslint-disable no-unused-expressions */ // to pacify "?."
            (this.$refs.AddLinkerWordsRef as InstanceType<typeof AddLinkerWords>)?.clear();
            (this.$refs.AddGenericNotesRef as InstanceType<typeof AddGenericNotes>)?.clear();
            (this.$refs.AddGenericExternalLinksRef as InstanceType<typeof AddGenericExternalLinks>)?.clear();
            /* eslint-enable no-unused-expressions */
            this.pristineVocabulary = {} as Vocabulary;
            this.unsubscribeBackButtonListener();
            this.backButtonUnsubscribeHandler = {} as BackButtonUnsubscribeHandler;
        },
        async back(): Promise<void> {
            await this.notifyUnsavedVocabulary(async () => {
                this.clear();
                this.$router.back();
            });
        },
        isWordGetsDirty(): boolean {
            let isDirty = false;
            if (this.isInCreationMode()) {
                isDirty = this.word.length > 0;
            } else if (this.isInUpdateMode()) {
                isDirty = this.word !== this.pristineVocabulary.word;
            }
            return isDirty;
        },
        isDefinitionsGetDirty(): boolean {
            let isDirty = false;
            if (this.isInCreationMode()) {
                isDirty = this.definitions.length > 0;
            } else if (this.isInUpdateMode()) {
                isDirty = isArrayOfObjectEqual<Definition>(
                    this.definitions,
                    this.pristineVocabulary.definitions as Definition[],
                );
            }
            return isDirty;
        },
        isLinkerWordsGetDirty(): boolean {
            let isDirty = false;
            if (this.isInCreationMode()) {
                isDirty = this.linkerWords.length > 0;
            } else if (this.isInUpdateMode()) {
                isDirty = isArrayOfStringEqual(this.linkerWords, this.pristineVocabulary.linkerWords as string[]);
            }
            return isDirty;
        },
        isGenericNotesGetDirty(): boolean {
            let isDirty = false;
            if (this.isInCreationMode()) {
                isDirty = this.genericNotes.length > 0;
            } else if (this.isInUpdateMode()) {
                isDirty = isArrayOfStringEqual(this.genericNotes, this.pristineVocabulary.genericNotes as string[]);
            }
            return isDirty;
        },
        isGenericExternalLinksGetDirty(): boolean {
            let isDirty = false;
            if (this.isInCreationMode()) {
                isDirty = this.genericExternalLinks.length > 0;
            } else if (this.isInUpdateMode()) {
                isDirty = isArrayOfStringEqual(
                    this.genericExternalLinks,
                    this.pristineVocabulary.genericExternalLinks as string[],
                );
            }
            return isDirty;
        },
        isDirty(): boolean {
            return (
                this.isWordGetsDirty() ||
                this.isDefinitionsGetDirty() ||
                this.isLinkerWordsGetDirty() ||
                this.isGenericNotesGetDirty() ||
                this.isGenericExternalLinksGetDirty()
            );
        },
        async notifyUnsavedVocabulary(handler: ProcessNextHandler): Promise<void> {
            if (!this.isDirty()) {
                this.unsubscribeBackButtonListener();
                await Promise.all([handler(), NativeStorage.setShouldReloadVocabularies(false)]);
            } else {
                await Alert.presentAlertConfirm(
                    '',
                    'You have an unsaved vocabulary that will be lost if you decide to leave. Are you sure you want to navigate away from this page?',
                    async () => {
                        this.unsubscribeBackButtonListener();
                        await Promise.all([handler(), NativeStorage.setShouldReloadVocabularies(false)]);
                    },
                );
            }
        },
    },
});
</script>

<style scoped>
.added-definition-card-content {
    padding-inline-start: unset;
    padding-inline-end: unset;
}
.added-definition-container {
    display: flex;
}
.added-definition-container:last-of-type {
    margin-bottom: unset;
}
.added-definition-action-buttons {
    display: flex;
    width: 100px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-left: calc(-1 * var(--ion-padding) / 2);
}
.added-definition-contents {
    display: flex;
    align-items: center;
    width: calc(100% - 100px - var(--ion-padding));
    padding-right: var(--ion-padding);
}
.add-definition-button-container {
    display: flex;
    justify-content: flex-end;
    padding-top: unset;
    margin-right: calc(-1 * var(--ion-padding) / 2);
}
.draft-toggle {
    padding-inline: unset;
}
</style>
