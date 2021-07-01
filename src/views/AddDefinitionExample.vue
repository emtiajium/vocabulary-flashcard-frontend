<template>
    <ion-item lines="none">
        <ion-card-title>Examples</ion-card-title>
    </ion-item>
    <view v-if="!$props.existingExamples">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
    <view v-if="$props.existingExamples">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="existingExamples" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonCardTitle } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionExample',
    components: {
        AddRemoveMultipleItems,
        IonCardTitle,
        IonItem,
    },
    props: ['existingExamples'],
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
