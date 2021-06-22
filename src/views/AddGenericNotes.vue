<template>
    <ion-item lines="none">
        <ion-label>Generic Notes</ion-label>
    </ion-item>
    <view v-for="(item, index) in itemsInGenericNotes" :key="index">
        <ion-item>
            <ion-input
                type="text"
                :value="genericNotes[index] || ''"
                @keyup="insertGenericNote($event.target.value, index)"
            ></ion-input>
            <ion-button
                v-show="index === itemsInGenericNotes.length - 1"
                color="success"
                @click="onAddMoreGenericNote"
                >{{ getAddButtonLabel(genericNotes.length) }}</ion-button
            >
            <ion-button
                v-show="index === itemsInGenericNotes.length - 1"
                color="danger"
                @click="onRemoveLastGenericNote(index)"
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
    name: 'AddGenericNotes',
    components: {
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
    },
    data() {
        return {
            itemsInGenericNotes: [uuidV4()],
            genericNotes: [] as string[],
        };
    },
    methods: {
        getAddButtonLabel(itemsLength: number) {
            return itemsLength ? 'Add More' : 'Add';
        },
        insertGenericNote(genericNote: string, index: number) {
            this.genericNotes[index] = genericNote.trim();
        },
        onAddMoreGenericNote() {
            this.itemsInGenericNotes.push(uuidV4());
        },
        onRemoveLastGenericNote(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInGenericNotes.pop();
            }
            this.genericNotes = this.genericNotes.filter((genericNote, index) => index !== removableIndex);
        },
        getGenericNotes() {
            return this.genericNotes.filter((genericNote) => genericNote.length > 0);
        },
        clear() {
            this.genericNotes = [];
            this.itemsInGenericNotes = [uuidV4()];
        },
    },
});
</script>

<style scoped></style>
