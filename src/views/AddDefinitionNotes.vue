<template>
    <ion-item lines="none">
        <ion-label>Notes</ion-label>
    </ion-item>
    <view v-for="(item, index) in itemsInNotes" :key="index">
        <ion-item>
            <ion-input
                type="text"
                :value="notes[index] || ''"
                @keyup="insertNote($event.target.value, index)"
            ></ion-input>
            <ion-button v-show="index === itemsInNotes.length - 1" color="success" @click="onAddMoreNote">{{
                getAddButtonLabel(notes.length)
            }}</ion-button>
            <ion-button v-show="index === itemsInNotes.length - 1" color="danger" @click="onRemoveLastNote(index)"
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
    name: 'AddDefinitionNotes',
    components: {
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
    },
    data() {
        return {
            itemsInNotes: [uuidV4()],
            notes: [] as string[],
        };
    },
    methods: {
        getAddButtonLabel(itemsLength: number) {
            return itemsLength ? 'Add More' : 'Add';
        },
        insertNote(note: string, index: number) {
            this.notes[index] = note.trim();
        },
        onAddMoreNote() {
            this.itemsInNotes.push(uuidV4());
        },
        onRemoveLastNote(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInNotes.pop();
            }
            this.notes = this.notes.filter((note, index) => index !== removableIndex);
        },
        getNotes() {
            return this.notes.filter((note) => note.length > 0);
        },
        clear() {
            this.notes = [];
            this.itemsInNotes = [uuidV4()];
        },
    },
});
</script>

<style scoped></style>
