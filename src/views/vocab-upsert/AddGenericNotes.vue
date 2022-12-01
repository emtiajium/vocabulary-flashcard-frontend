<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title> Generic Notes </ion-card-title>
            <ion-card-subtitle class="tips">
                <span class="material-icons"> tips_and_updates </span>
                <span class="info">
                    Any gibberish note can be put here, for example, the origin of the word, pronunciation, etc.
                </span>
            </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="existingGenericNotes" />
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/vocab-upsert/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddGenericNotes',
    components: {
        AddRemoveMultipleItems,
        IonCard,
        IonCardTitle,
        IonCardSubtitle,
        IonCardHeader,
        IonCardContent,
    },
    props: ['existingGenericNotes'],
    data() {
        return {
            genericNotes: (this.existingGenericNotes || []) as string[],
        };
    },
    methods: {
        getGenericNotes(): string[] {
            this.genericNotes = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.genericNotes;
        },
        clear(): void {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.genericNotes = [];
        },
    },
});
</script>

<style scoped></style>
