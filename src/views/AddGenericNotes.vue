<template>
    <ion-item lines="none">
        <ion-label>Generic Notes</ion-label>
    </ion-item>
    <view v-if="$props.existingGenericNotes">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existingItems="existingGenericNotes" />
    </view>
    <view v-if="!$props.existingGenericNotes">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonLabel } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddGenericNotes',
    components: {
        AddRemoveMultipleItems,
        IonLabel,
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
