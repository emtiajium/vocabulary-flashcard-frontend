<template>
    <ion-item lines="none">
        <ion-label>Notes</ion-label>
    </ion-item>
    <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonLabel } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionNotes',
    components: {
        AddRemoveMultipleItems,
        IonLabel,
        IonItem,
    },
    data() {
        return {
            notes: [] as string[],
        };
    },
    methods: {
        getNotes() {
            this.notes = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.notes;
        },
        clear() {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.notes = [];
        },
    },
});
</script>

<style scoped></style>
