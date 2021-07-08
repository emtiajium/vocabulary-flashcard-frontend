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
        };
    },
    mounted() {
        this.meaning = this.$props.definition?.meaning || '';
    },
    methods: {
        getAddButtonLabel(itemsLength: number): string {
            return itemsLength ? 'Add More' : 'Add';
        },
        setMeaning(meaning: string): void {
            this.meaning = meaning.trim();
        },
        getDefinitionPayload(): Definition {
            const definition = new Definition();
            definition.id = this.definition?.id || uuidV4();
            definition.vocabularyId = this.vocabularyId;
            definition.meaning = this.meaning;
            definition.examples = (
                this.$refs.AddDefinitionExamplesRef as InstanceType<typeof AddDefinitionExamples>
            ).getExamples();
            definition.notes = (this.$refs.AddDefinitionNotesRef as InstanceType<typeof AddDefinitionNotes>).getNotes();
            definition.externalLinks = (
                this.$refs.AddDefinitionExternalLinksRef as InstanceType<typeof AddDefinitionExternalLinks>
            ).getExternalLinks();
            return definition;
        },
        async persist(): Promise<void> {
            const definition = this.getDefinitionPayload();
            const errors = validateSync(definition);
            if (errors.length) {
                await Toast.present(ValidationErrorTransform.transform(errors)[0]);
            } else {
                this.afterAddingDefinition(definition);
                this.clear();
            }
        },
        clear(): void {
            this.setMeaning('');
            (this.$refs.AddDefinitionExamplesRef as InstanceType<typeof AddDefinitionExamples>).clear();
            (this.$refs.AddDefinitionNotesRef as InstanceType<typeof AddDefinitionNotes>).clear();
            (this.$refs.AddDefinitionExternalLinksRef as InstanceType<typeof AddDefinitionExternalLinks>).clear();
        },
        back(): void {
            this.clear();
            this.onCancellingAddingDefinition();
        },
    },
});
</script>

<style scoped></style>
