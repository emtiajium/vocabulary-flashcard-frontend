<template>
    <ion-item lines="none">
        <ion-label>Examples</ion-label>
    </ion-item>
    <view v-for="(item, index) in itemsInExamples" :key="index">
        <ion-item>
            <ion-input
                type="url"
                :value="examples[index] || ''"
                @keyup="insertExample($event.target.value, index)"
            ></ion-input>
            <ion-button v-show="index === itemsInExamples.length - 1" color="success" @click="onAddMoreExample">{{
                getAddButtonLabel(examples.length)
            }}</ion-button>
            <ion-button v-show="index === itemsInExamples.length - 1" color="danger" @click="onRemoveLastExample(index)"
                >Remove</ion-button
            >
        </ion-item>
    </view>
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
        getAddButtonLabel(itemsLength: number) {
            return itemsLength ? 'Add More' : 'Add';
        },
        insertExample(example: string, index: number) {
            this.examples[index] = example.trim();
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
            return this.examples.filter((example) => example.length > 0);
        },
        clear() {
            this.examples = [];
            this.itemsInExamples = [uuidV4()];
        },
    },
});
</script>

<style scoped></style>
