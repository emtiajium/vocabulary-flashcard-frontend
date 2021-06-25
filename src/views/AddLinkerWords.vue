<template>
    <ion-item lines="none">
        <ion-label>Linker Words</ion-label>
    </ion-item>
    <view v-if="$props.existingLinkerWords">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existingItems="linkerWords" />
    </view>
    <view v-if="!$props.existingLinkerWords">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonLabel } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddLinkerWords',
    components: {
        AddRemoveMultipleItems,
        IonLabel,
        IonItem,
    },
    props: ['existingLinkerWords'],
    data() {
        return {
            linkerWords: (this.existingLinkerWords || []) as string[],
        };
    },
    methods: {
        getLinkerWords() {
            this.linkerWords = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.linkerWords;
        },
        clear() {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.linkerWords = [];
        },
    },
});
</script>

<style scoped></style>
