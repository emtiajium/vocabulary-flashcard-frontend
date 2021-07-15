<template>
    <ion-page>
        <firecracker-header
            :header-title="word"
            content-id="add-definition"
            menu-id="add-definition-menu"
            type="MENU"
        />

        <ion-content :fullscreen="true" id="add-definition">
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Meaning</ion-card-title>
                    <ion-card-subtitle>An idea or a thing that a word represents</ion-card-subtitle>
                </ion-card-header>

                <ion-card-content>
                    <ion-item>
                        <ion-textarea
                            v-if="!$props.definition"
                            autoGrow="true"
                            inputmode="text"
                            :value="meaning"
                            @keyup="setMeaning($event.target.value)"
                        />
                        <ion-textarea
                            v-if="$props.definition"
                            autoGrow="true"
                            inputmode="text"
                            :value="definition.meaning"
                            @keyup="setMeaning($event.target.value)"
                        />
                    </ion-item>
                </ion-card-content>
            </ion-card>

            <view v-if="!$props.definition">
                <add-definition-examples ref="AddDefinitionExamplesRef" />
                <add-definition-notes ref="AddDefinitionNotesRef" />
                <add-definition-external-links ref="AddDefinitionExternalLinksRef" />
            </view>

            <view v-if="$props.definition">
                <add-definition-examples ref="AddDefinitionExamplesRef" :existing-examples="definition.examples" />
                <add-definition-notes ref="AddDefinitionNotesRef" :existing-notes="definition.notes" />
                <add-definition-external-links
                    ref="AddDefinitionExternalLinksRef"
                    :existing-external-links="definition.externalLinks"
                />
            </view>

            <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <ion-button color="warning" expand="block" @click="back">Cancel</ion-button>
                    </ion-col>
                    <ion-col size="6">
                        <ion-button color="success" expand="block" @click="persist">Save</ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
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
    IonGrid,
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
        IonGrid,
        IonRow,
        IonCol,
        IonTextarea,
        IonItem,
    },
    props: ['word', 'vocabularyId', 'definition', 'afterAddingDefinition', 'onCancellingAddingDefinition'],
    data() {
        return {
            meaning: '',
            pristineDefinition: {} as Definition,
            backButtonUnsubscribeHandler: {} as BackButtonUnsubscribeHandler,
        };
    },
    mounted() {
        if (this.$props.definition) {
            // https://v3.vuejs.org/guide/reactivity.html
            // https://v3.vuejs.org/api/basic-reactivity.html
            // otherwise isDirty() won't work
            this.pristineDefinition = _.cloneDeep(this.$props.definition) as Definition;
            this.meaning = this.pristineDefinition.meaning;
        }
        this.backButtonUnsubscribeHandler = useBackButton(BackButtonHandlerPriority.ADD_DEFINITION, async () => {
            await this.back();
        });
    },
    methods: {
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
                this.unsubscribeBackButtonListener();
                this.afterAddingDefinition(definition);
                this.clear();
            }
        },
        unsubscribeBackButtonListener(): void {
            this.backButtonUnsubscribeHandler.unregister();
        },
        clear(): void {
            this.setMeaning('');
            (this.$refs.AddDefinitionExamplesRef as InstanceType<typeof AddDefinitionExamples>).clear();
            (this.$refs.AddDefinitionNotesRef as InstanceType<typeof AddDefinitionNotes>).clear();
            (this.$refs.AddDefinitionExternalLinksRef as InstanceType<typeof AddDefinitionExternalLinks>).clear();
            this.pristineDefinition = {} as Definition;
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

<style scoped></style>
