<template>
    <ion-item lines="none">
        <ion-label>Examples</ion-label>
    </ion-item>
    <div v-for="(item, index) in itemsInExamples" :key="index">
        <ion-item>
            <ion-input
                type="url"
                :value="examples[index] || ''"
                @keyup="insertExample($event.target.value, index)"
            ></ion-input>
            <ion-button v-show="index === itemsInExamples.length - 1" @click="onAddMoreExample">Add More</ion-button>
            <ion-button v-show="index === itemsInExamples.length - 1" @click="onRemoveLastExample(index)"
                >Remove</ion-button
            >
        </ion-item>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonInput, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { v4 as uuidV4 } from 'uuid';

export default defineComponent({
    name: 'AddDefinitionExample',
    components: {
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
    },
    data() {
        return {
            itemsInExamples: [uuidV4()],
            examples: [] as string[],
        };
    },
    methods: {
        insertExample(example: string, index: number) {
            this.examples[index] = example;
        },
        onAddMoreExample() {
            this.itemsInExamples.push(uuidV4());
        },
        onRemoveLastExample(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInExamples.pop();
            }
            this.examples = this.examples.filter((example, index) => index !== removableIndex);
        },
        getExamples() {
            return this.examples.filter((example) => example.trim().length > 0);
        },
    },
});
</script>

<style scoped></style>
