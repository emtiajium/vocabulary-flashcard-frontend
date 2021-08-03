<template>
    <!--tried with routing, but could not find a way to set the definition before navigating back to this page-->
    <ion-page v-bind="$attrs" v-if="!isInDefinition()">
        <firecracker-header :header-title="headerTitle" content-id="add-vocabulary" menu-id="add-vocabulary-menu" />

        <ion-content :fullscreen="true" id="add-vocabulary">
            <spinner v-if="isLoading" />

            <view v-if="!isLoading">
                <ion-card>
                    <ion-card-header>
                        <ion-card-title> Word </ion-card-title>
                        <ion-card-subtitle>
                            A word, an idiom, even a prepositional phrase and most importantly whatever you wish to
                            insert
                        </ion-card-subtitle>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-item>
                            <ion-textarea
                                autoGrow="true"
                                inputmode="text"
                                autocapitalize="sentences"
                                placeholder="Type something"
                                :value="word"
                                @ionChange="setWord($event.target.value)"
                            />
                        </ion-item>
                    </ion-card-content>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                        <ion-card-title> Definitions </ion-card-title>
                        <ion-card-subtitle> An explanation of what a word means </ion-card-subtitle>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-item v-if="!isLoading" lines="none">
                            <ion-button color="success" @click="onAddingDefinition">
                                <view v-if="!definitions.length">
                                    <font-awesome-icon :icon="faPlusCircle" />
                                </view>
                                <view v-if="definitions.length">
                                    <span class="material-icons"> plus_one </span>
                                </view>
                            </ion-button>
                        </ion-item>
                        <view v-if="!isLoading">
                            <view
                                v-show="definitions.length"
                                v-for="(definition, index) in definitions"
                                :key="definition.id"
                            >
                                <ion-item lines="none">
                                    <ion-label color="dark" class="capitalize ion-text-nowrap">
                                        {{ definition.meaning }}
                                    </ion-label>
                                </ion-item>
                                <ion-item>
                                    <ion-item-group>
                                        <ion-button color="warning" @click="updateDefinition(index)">
                                            <font-awesome-icon :icon="faPencilAlt" />
                                        </ion-button>
                                        <ion-button color="danger" @click="removeDefinition(index)">
                                            <font-awesome-icon :icon="faMinusCircle" />
                                        </ion-button>
                                    </ion-item-group>
                                </ion-item>
                            </view>
                        </view>
                    </ion-card-content>
                </ion-card>

                <view v-if="isInCreationMode()">
                    <add-linker-words ref="AddLinkerWordsRef" />
                    <add-generic-notes ref="AddGenericNotesRef" />
                    <add-generic-external-links ref="AddGenericExternalLinksRef" />
                </view>

                <view v-if="isInUpdateMode()">
                    <add-linker-words ref="AddLinkerWordsRef" :existing-linker-words="linkerWords" />
                    <add-generic-notes ref="AddGenericNotesRef" :existing-generic-notes="genericNotes" />
                    <add-generic-external-links
                        ref="AddGenericExternalLinksRef"
                        :existing-generic-external-links="genericExternalLinks"
                    />
                </view>

                <ion-card>
                    <ion-card-header>
                        <ion-card-title> Is Draft </ion-card-title>
                        <ion-card-subtitle>
                            It is possible to save a vocabulary without a definition in draft mode
                        </ion-card-subtitle>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-toggle :checked="isDraft" @ionChange="setIsDraft($event.target.checked)" />
                    </ion-card-content>
                </ion-card>

                <ion-grid>
                    <ion-row>
                        <ion-col size="6">
                            <ion-button fill="outline" color="warning" expand="block" @click="back">
                                Cancel
                            </ion-button>
                        </ion-col>
                        <ion-col size="6">
                            <ion-button color="success" expand="block" @click="persist"> Save </ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </view>
        </ion-content>
    </ion-page>

    <!--https://v3.vuejs.org/guide/component-attrs.html#disabling-attribute-inheritance-->
    <ion-page v-bind="$attrs" v-if="isInDefinition()">
        <view v-if="!isInDefinitionUpdateMode()">
            <add-definition
                :word="word"
                :vocabularyId="id"
                :after-adding-definition="afterAddingDefinition"
                :on-cancelling-adding-definition="onCancellingAddingDefinition"
            />
        </view>
        <view v-if="isInDefinitionUpdateMode()">
            <add-definition
                :word="word"
                :vocabularyId="id"
                :definition="goingToBeUpdatedDefinition"
                :after-adding-definition="afterUpdatingDefinition"
                :on-cancelling-adding-definition="onCancellingAddingDefinition"
            />
        </view>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonContent,
    IonTextarea,
    IonItem,
    IonLabel,
    IonPage,
    IonToggle,
    IonButton,
    IonItemGroup,
    IonCard,
    IonGrid,
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
import Vocabulary from '@/domains/Vocabulary';
import { v4 as uuidV4 } from 'uuid';
import AddLinkerWords from '@/views/AddLinkerWords.vue';
import AddGenericNotes from '@/views/AddGenericNotes.vue';
import AddGenericExternalLinks from '@/views/AddGenericExternalLinks.vue';
import Definition from '@/domains/Definition';
import AddDefinition from '@/views/AddDefinition.vue';
import { validateSync } from 'class-validator';
import ValidationErrorTransform from '@/utils/ValidationErrorTransform';
import Spinner from '@/views/Spinner.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlusCircle, faMinusCircle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import MessageDB from '@/utils/MessageDB';
import NativeStorage from '@/utils/NativeStorage';
import Alert from '@/utils/Alert';
import * as _ from 'lodash';
import { isArrayOfStringEqual, isArrayOfObjectEqual } from '@/utils/is-equal';
import BackButtonHandlerPriority from '@/domains/BackButtonHandlerPriority';
import { BackButtonUnsubscribeHandler, ProcessNextHandler } from '@/domains/Handlers';

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
        FirecrackerHeader,
        Spinner,
        AddDefinition,
        AddLinkerWords,
        AddGenericNotes,
        AddGenericExternalLinks,
        IonContent,
        IonPage,
        IonTextarea,
        IonLabel,
        IonItem,
        IonToggle,
        IonButton,
        IonItemGroup,
        IonCard,
        IonGrid,
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
            faPlusCircle,
            faMinusCircle,
            faPencilAlt,
            pristineVocabulary: {} as Vocabulary,
            backButtonUnsubscribeHandler: {} as BackButtonUnsubscribeHandler,
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
        async onAddingDefinition(): Promise<void> {
            if (!this.word) {
                await Toast.present(`Please insert the word before adding the definition`);
            } else {
                this.setCurrentPage(PageType.ADD_DEFINITION);
            }
        },
        setCurrentPage(currentPage: PageType): void {
            this.currentPage = currentPage;
        },
        isInDefinition(): boolean {
            return this.currentPage === PageType.ADD_DEFINITION;
        },
        isInDefinitionCreationMode(): boolean {
            return this.mode === Mode.DEFINITION_CREATE;
        },
        isInDefinitionUpdateMode(): boolean {
            return this.mode === Mode.DEFINITION_UPDATE;
        },
        isInCreationMode(): boolean {
            return this.mode === Mode.VOCABULARY_CREATE || this.isInDefinitionCreationMode();
        },
        isInUpdateMode(): boolean {
            return this.mode === Mode.VOCABULARY_UPDATE || this.isInDefinitionUpdateMode();
        },
        afterAddingDefinition(definition: Definition): void {
            this.insertDefinition(definition);
            this.setCurrentPage(PageType.ADD_VOCABULARY);
        },
        afterUpdatingDefinition(definition: Definition): void {
            this.definitions[this.definitions.findIndex(({ id }) => definition.id === id)] = definition as Definition;
            this.setCurrentPage(PageType.ADD_VOCABULARY);
        },
        onCancellingAddingDefinition(): void {
            this.setCurrentPage(PageType.ADD_VOCABULARY);
        },
        insertDefinition(definition: Definition): void {
            this.definitions.push(definition);
            this.mode = Mode.DEFINITION_CREATE;
        },
        removeDefinition(removableIndex: number): void {
            this.definitions = this.definitions.filter((definition, index) => index !== removableIndex);
        },
        setGoingToBeUpdatedDefinition(updatableIndex: number): void {
            this.goingToBeUpdatedDefinition = this.definitions.find(
                (definition, index) => index === updatableIndex,
            ) as Definition;
        },
        updateDefinition(updatableIndex: number): void {
            this.setGoingToBeUpdatedDefinition(updatableIndex);
            this.mode = Mode.DEFINITION_UPDATE;
            this.setCurrentPage(PageType.ADD_DEFINITION);
        },
        getVocabularyPayload(): Vocabulary {
            const vocabulary = new Vocabulary();
            vocabulary.id = this.id;
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
                await HttpHandler.post<Vocabulary, Vocabulary>(`/v1/vocabularies`, vocabulary);
                this.clear();
                if (!this.$route.params?.id) {
                    await NativeStorage.setShouldReloadVocabularies(true);
                } else {
                    await NativeStorage.setUpdatedVocabulary(_.cloneDeep(vocabulary));
                }
                // replace instead of push so that this route won't be appeared (hardware back-button)
                await this.$router.replace(`/vocabularies`);
            } catch (error) {
                await Toast.present(error.message);
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
            this.currentPage = PageType.ADD_VOCABULARY;
            this.goingToBeUpdatedDefinition = {} as Definition;
            (this.$refs.AddLinkerWordsRef as InstanceType<typeof AddLinkerWords>).clear();
            (this.$refs.AddGenericNotesRef as InstanceType<typeof AddGenericNotes>).clear();
            (this.$refs.AddGenericExternalLinksRef as InstanceType<typeof AddGenericExternalLinks>).clear();
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

<style scoped></style>
