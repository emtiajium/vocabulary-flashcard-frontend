<template>
    <ion-page>
        <firecracker-header
            :header-title="word"
            content-id="add-definition"
            menu-id="add-definition-menu"
            type="MENU"
        />

        <ion-content :fullscreen="true" id="add-definition">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="10" sizeXl="10">
                    <ion-card class="margin-top-unset">
                        <ion-card-header>
                            <ion-card-title> Meaning </ion-card-title>
                            <ion-card-subtitle> An idea or a thing that a word represents </ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-item>
                                <ion-textarea
                                    autoGrow="true"
                                    inputmode="text"
                                    autocapitalize="sentences"
                                    placeholder="Type something"
                                    :value="$props.definition ? definition.meaning : meaning"
                                    @ionChange="setMeaning($event.target.value)"
                                />
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <add-definition-examples ref="AddDefinitionExamplesRef" :existing-examples="definition?.examples" />
                    <add-definition-notes ref="AddDefinitionNotesRef" :existing-notes="definition?.notes" />
                    <add-definition-external-links
                        ref="AddDefinitionExternalLinksRef"
                        :existing-external-links="definition?.externalLinks"
                    />

                    <ion-row class="buttons-container">
                        <ion-col sizeXs="6" sizeSm="4" sizeMd="2" sizeLg="2" sizeXl="2" class="cancel-button-container">
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
                        <ion-col sizeXs="6" sizeSm="4" sizeMd="2" sizeLg="2" sizeXl="2" class="save-button-container">
                            <ion-button color="success" expand="block" class="save-button" @click="persist">
                                Save
                            </ion-button>
                        </ion-col>
                    </ion-row>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {
    IonContent,
    IonPage,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonRow,
    IonCol,
    IonTextarea,
    IonItem,
    useBackButton,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import AddDefinitionExamples from '@/views/AddDefinitionExamples.vue';
import AddDefinitionNotes from '@/views/AddDefinitionNotes.vue';
import AddDefinitionExternalLinks from '@/views/AddDefinitionExternalLinks.vue';
import Definition from '@/domains/Definition';
import { v4 as uuidV4 } from 'uuid';
import { validateSync } from 'class-validator';
import Toast from '@/utils/Toast';
import ValidationErrorTransform from '@/utils/ValidationErrorTransform';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import { isArrayOfStringEqual } from '@/utils/is-equal';
import Alert from '@/utils/Alert';
import * as _ from 'lodash';
import BackButtonHandlerPriority from '@/domains/BackButtonHandlerPriority';
import { BackButtonUnsubscribeHandler, ProcessNextHandler } from '@/domains/Handlers';

export default defineComponent({
    name: 'AddDefinition',
    components: {
        FirecrackerHeader,
        AddDefinitionExternalLinks,
        AddDefinitionNotes,
        AddDefinitionExamples,
        IonContent,
        IonPage,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonButton,
        IonRow,
        IonCol,
        IonTextarea,
        IonItem,
    },
    props: ['word', 'vocabularyId', 'definition', 'onComingBackToVocab', 'onCancellingAddingDefinition'],
    data() {
        return {
            meaning: '',
            pristineDefinition: {} as Definition,
            backButtonUnsubscribeHandler: {} as BackButtonUnsubscribeHandler,
        };
    },
    mounted() {
        if (!_.isEmpty(this.$props.definition)) {
            // https://v3.vuejs.org/guide/reactivity.html
            // https://v3.vuejs.org/api/basic-reactivity.html
            // otherwise isDirty() won't work
            this.pristineDefinition = _.cloneDeep(this.$props.definition) as Definition;
            this.meaning = this.pristineDefinition.meaning;
        }
        this.subscribeToHardwareBackButtonListener();
    },
    beforeUnmount() {
        this.clear();
    },
    methods: {
        subscribeToHardwareBackButtonListener(): void {
            this.unsubscribeBackButtonListener();
            this.backButtonUnsubscribeHandler = useBackButton(BackButtonHandlerPriority.ADD_DEFINITION, async () => {
                await this.back();
            });
        },
        setMeaning(meaning: string): void {
            this.meaning = meaning.trim();
        },
        getExamples(): string[] {
            return (this.$refs.AddDefinitionExamplesRef as InstanceType<typeof AddDefinitionExamples>).getExamples();
        },
        getNotes(): string[] {
            return (this.$refs.AddDefinitionNotesRef as InstanceType<typeof AddDefinitionNotes>).getNotes();
        },
        getExternalLinks(): string[] {
            return (
                this.$refs.AddDefinitionExternalLinksRef as InstanceType<typeof AddDefinitionExternalLinks>
            ).getExternalLinks();
        },
        getDefinitionPayload(): Definition {
            const definition = new Definition();
            definition.id = this.definition?.id || uuidV4();
            definition.vocabularyId = this.vocabularyId;
            definition.meaning = this.meaning;
            definition.examples = this.getExamples();
            definition.notes = this.getNotes();
            definition.externalLinks = this.getExternalLinks();
            return definition;
        },
        async persist(): Promise<void> {
            const definition = this.getDefinitionPayload();
            const errors = validateSync(definition);
            if (errors.length) {
                await Toast.present(ValidationErrorTransform.transform(errors)[0]);
            } else {
                this.onComingBackToVocab(definition);
                this.clear();
            }
        },
        unsubscribeBackButtonListener(): void {
            if (!_.isEmpty(this.backButtonUnsubscribeHandler)) {
                this.backButtonUnsubscribeHandler.unregister();
            }
        },
        clear(): void {
            this.setMeaning('');
            (this.$refs.AddDefinitionExamplesRef as InstanceType<typeof AddDefinitionExamples>).clear();
            (this.$refs.AddDefinitionNotesRef as InstanceType<typeof AddDefinitionNotes>).clear();
            (this.$refs.AddDefinitionExternalLinksRef as InstanceType<typeof AddDefinitionExternalLinks>).clear();
            this.pristineDefinition = {} as Definition;
            this.unsubscribeBackButtonListener();
            this.backButtonUnsubscribeHandler = {} as BackButtonUnsubscribeHandler;
        },
        async back(): Promise<void> {
            await this.notifyUnsavedDefinition(() => {
                this.clear();
                this.onCancellingAddingDefinition();
            });
        },
        isMeaningGetsDirty(): boolean {
            return !_.isEmpty(this.pristineDefinition)
                ? this.meaning !== this.pristineDefinition.meaning
                : this.meaning.length > 0;
        },
        isExamplesGetDirty(): boolean {
            return !_.isEmpty(this.pristineDefinition)
                ? isArrayOfStringEqual(this.getExamples(), this.pristineDefinition.examples as string[])
                : this.getExamples().length > 0;
        },
        isNotesGetDirty(): boolean {
            return !_.isEmpty(this.pristineDefinition)
                ? isArrayOfStringEqual(this.getNotes(), this.pristineDefinition.notes as string[])
                : this.getNotes().length > 0;
        },
        isExternalLinksGetDirty(): boolean {
            return !_.isEmpty(this.pristineDefinition)
                ? isArrayOfStringEqual(this.getExternalLinks(), this.pristineDefinition.externalLinks as string[])
                : this.getExternalLinks().length > 0;
        },
        isDirty(): boolean {
            return (
                this.isMeaningGetsDirty() ||
                this.isExamplesGetDirty() ||
                this.isNotesGetDirty() ||
                this.isExternalLinksGetDirty()
            );
        },
        async notifyUnsavedDefinition(handler: ProcessNextHandler): Promise<void> {
            if (!this.isDirty()) {
                this.unsubscribeBackButtonListener();
                await handler();
            } else {
                await Alert.presentAlertConfirm(
                    '',
                    'You have an unsaved definition that will be lost if you decide to leave. Are you sure you want to navigate away from this page?',
                    async () => {
                        this.unsubscribeBackButtonListener();
                        return Promise.resolve(handler());
                    },
                );
            }
        },
    },
});
</script>

<style scoped>
.buttons-container {
    justify-content: flex-end;
    margin-top: 25px;
    margin-bottom: 25px;
}
.cancel-button-container {
    padding-inline-start: unset;
}
.save-button-container {
    padding-inline-end: unset;
}
.cancel-button {
    margin-inline-start: unset;
}
.save-button {
    margin-inline-end: unset;
}
</style>
