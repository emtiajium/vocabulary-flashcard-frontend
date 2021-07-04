<template>
    <ion-item lines="none">
        <ion-card-title>Notes</ion-card-title>
    </ion-item>
    <ion-item lines="none">
        <div class="form-text">
            It can be a ninja technique to memorize the meaning, a personal relatable incident, etc
        </div>
    </ion-item>
    <view v-if="!$props.existingNotes">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
    <view v-if="$props.existingNotes">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="existingNotes" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonCardTitle } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionNotes',
    components: {
        AddRemoveMultipleItems,
        IonCardTitle,
        IonItem,
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
