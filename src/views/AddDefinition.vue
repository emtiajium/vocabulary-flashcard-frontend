<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title class="capitalize">{{ word }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-card>
                <ion-item lines="none">
                    <ion-label>Meaning</ion-label>
                </ion-item>
                <ion-item>
                    <view v-if="!$props.definition">
                        <ion-input type="text" :value="meaning" @keyup="setMeaning($event.target.value)"></ion-input>
                    </view>
                    <view v-if="$props.definition">
                        <ion-input
                            type="text"
                            :value="definition.meaning"
                            @keyup="setMeaning($event.target.value)"
                        ></ion-input>
                    </view>
                </ion-item>

                <view v-if="!$props.definition">
                    <add-definition-example ref="AddDefinitionExampleRef" />
                    <add-definition-notes ref="AddDefinitionNotesRef" />
                    <add-definition-external-links ref="AddDefinitionExternalLinksRef" />
                </view>

                <view v-if="$props.definition">
                    <add-definition-example ref="AddDefinitionExampleRef" :existingExamples="definition.examples" />
                    <add-definition-notes ref="AddDefinitionNotesRef" :existingNotes="definition.notes" />
                    <add-definition-external-links
                        ref="AddDefinitionExternalLinksRef"
                        :existingExternalLinks="definition.externalLinks"
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
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
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

export default defineComponent({
    name: 'AddDefinition',
    components: {
        AddDefinitionExternalLinks,
        AddDefinitionNotes,
        AddDefinitionExample,
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
        IonCard,
        IonGrid,
        IonRow,
        IonCol,
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
