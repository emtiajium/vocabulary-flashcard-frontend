<template>
    <ion-item lines="none">
        <ion-label>Linker Words</ion-label>
    </ion-item>
    <div v-for="(item, index) in itemsInLinkerWords" :key="index">
        <ion-item>
            <ion-input
                type="text"
                :value="linkerWords[index] || ''"
                @keyup="insertLinkerWord($event.target.value, index)"
            ></ion-input>
            <ion-button v-show="index === itemsInLinkerWords.length - 1" @click="onAddMoreLinkerWord"
                >Add More</ion-button
            >
            <ion-button v-show="index === itemsInLinkerWords.length - 1" @click="onRemoveLastLinkerWord(index)"
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
    name: 'AddLinkerWords',
    components: {
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
    },
    data() {
        return {
            itemsInLinkerWords: [uuidV4()],
            linkerWords: [] as string[],
        };
    },
    methods: {
        insertLinkerWord(linkerWord: string, index: number) {
            this.linkerWords[index] = linkerWord.trim();
        },
        onAddMoreLinkerWord() {
            this.itemsInLinkerWords.push(uuidV4());
        },
        onRemoveLastLinkerWord(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInLinkerWords.pop();
            }
            this.linkerWords = this.linkerWords.filter((linkerWord, index) => index !== removableIndex);
        },
        getLinkerWords() {
            return this.linkerWords.filter((linkerWord) => linkerWord.length > 0);
        },
    },
});
</script>

<style scoped></style>
