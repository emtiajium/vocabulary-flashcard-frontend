<template>
    <ion-item lines="none">
        <ion-label>Examples</ion-label>
    </ion-item>
    <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonLabel } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionExample',
    components: {
        AddRemoveMultipleItems,
        IonLabel,
        IonItem,
    },
    data() {
        return {
            examples: [] as string[],
        };
    },
    methods: {
        getExamples() {
            this.examples = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.examples;
        },
        clear() {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.examples = [];
        },
    },
});
</script>

<style scoped></style>
