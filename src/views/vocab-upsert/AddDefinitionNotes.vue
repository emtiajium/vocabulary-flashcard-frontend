<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title> Notes </ion-card-title>
            <ion-card-subtitle class="tips">
                <span class="material-icons"> tips_and_updates </span>
                <span class="info">
                    It can be a ninja technique to memorize the meaning, a personal relatable incident, etc.
                </span>
            </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <add-remove-multiple-items
                ref="AddRemoveMultipleItemsRef"
                :existing-items="existingNotes"
                :item-class="'vocab-upsert-item'"
            />
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/vocab-upsert/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionNotes',
    components: {
        AddRemoveMultipleItems,
        IonCard,
        IonCardTitle,
        IonCardSubtitle,
        IonCardHeader,
        IonCardContent,
    },
    props: ['existingNotes'],
    data() {
        return {
            notes: [] as string[],
        };
    },
    methods: {
        getNotes(): string[] {
            this.notes = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.notes;
        },
        clear(): void {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.notes = [];
        },
    },
});
</script>

<style scoped></style>
