<template>
    <ion-item lines="none">
        <ion-card-title>Generic Notes</ion-card-title>
    </ion-item>
    <view v-if="$props.existingGenericNotes">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="existingGenericNotes" />
    </view>
    <view v-if="!$props.existingGenericNotes">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonCardTitle } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddGenericNotes',
    components: {
        AddRemoveMultipleItems,
        IonCardTitle,
        IonItem,
    },
    props: ['existingGenericNotes'],
    data() {
        return {
            genericNotes: (this.existingGenericNotes || []) as string[],
        };
    },
    methods: {
        getGenericNotes() {
            this.genericNotes = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.genericNotes;
        },
        clear() {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.genericNotes = [];
        },
    },
});
</script>

<style scoped></style>
