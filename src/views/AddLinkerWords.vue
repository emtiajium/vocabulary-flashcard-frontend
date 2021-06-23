<template>
    <ion-item lines="none">
        <ion-label>Linker Words</ion-label>
    </ion-item>
    <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
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
    data() {
        return {
            linkerWords: [] as string[],
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
