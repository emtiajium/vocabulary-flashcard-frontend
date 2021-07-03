<template>
    <ion-page>
        <firecracker-header :header-title="word" content-id="add-definition" menu-id="add-definition-menu" />

        <ion-content :fullscreen="true" id="add-definition">
            <ion-card>
                <ion-item lines="none">
                    <ion-card-title>Meaning</ion-card-title>
                </ion-item>
                <ion-item lines="none">
                    <div class="form-text">An idea or a thing that a word represents</div>
                </ion-item>

                <ion-item v-if="!$props.definition">
                    <ion-textarea
                        autoGrow="true"
                        inputmode="text"
                        :value="meaning"
                        @keyup="setMeaning($event.target.value)"
                    />
                </ion-item>
                <ion-item v-if="$props.definition">
                    <ion-textarea
                        autoGrow="true"
                        inputmode="text"
                        :value="definition.meaning"
                        @keyup="setMeaning($event.target.value)"
                    />
                </ion-item>

                <view v-if="!$props.definition">
                    <add-definition-example ref="AddDefinitionExampleRef" />
                    <add-definition-notes ref="AddDefinitionNotesRef" />
                    <add-definition-external-links ref="AddDefinitionExternalLinksRef" />
                </view>

                <view v-if="$props.definition">
                    <add-definition-example ref="AddDefinitionExampleRef" :existing-examples="definition.examples" />
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
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {
    IonContent,
    IonItem,
    IonPage,
    IonButton,
    IonCard,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonTextarea,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import AddDefinitionExample from '@/views/AddDefinitionExample.vue';
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
        AddDefinitionExample,
        IonContent,
        IonPage,
        IonCardTitle,
        IonItem,
        IonButton,
        IonCard,
        IonGrid,
        IonRow,
        IonCol,
        IonTextarea,
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
        getAddButtonLabel(itemsLength: number) {
            return itemsLength ? 'Add More' : 'Add';
        },
        setMeaning(meaning: string) {
            this.meaning = meaning.trim();
        },
        getDefinitionPayload() {
            const definition = new Definition();
            definition.id = this.definition?.id || uuidV4();
            definition.vocabularyId = this.vocabularyId;
            definition.meaning = this.meaning;
            definition.examples = (
                this.$refs.AddDefinitionExampleRef as InstanceType<typeof AddDefinitionExample>
            ).getExamples();
            definition.notes = (this.$refs.AddDefinitionNotesRef as InstanceType<typeof AddDefinitionNotes>).getNotes();
            definition.externalLinks = (
                this.$refs.AddDefinitionExternalLinksRef as InstanceType<typeof AddDefinitionExternalLinks>
            ).getExternalLinks();
            return definition;
        },
        async persist() {
            const definition = this.getDefinitionPayload();
            const errors = validateSync(definition);
            if (errors.length) {
                await Toast.present(ValidationErrorTransform.transform(errors)[0]);
            } else {
                this.afterAddingDefinition(definition);
                this.clear();
            }
        },
        clear() {
            this.setMeaning('');
            (this.$refs.AddDefinitionExampleRef as InstanceType<typeof AddDefinitionExample>).clear();
            (this.$refs.AddDefinitionNotesRef as InstanceType<typeof AddDefinitionNotes>).clear();
            (this.$refs.AddDefinitionExternalLinksRef as InstanceType<typeof AddDefinitionExternalLinks>).clear();
        },
        back() {
            this.clear();
            this.onCancellingAddingDefinition();
        },
    },
});
</script>

<style scoped></style>
