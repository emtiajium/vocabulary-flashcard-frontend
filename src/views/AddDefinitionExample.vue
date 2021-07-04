<template>
    <ion-item lines="none">
        <ion-card-title>Examples</ion-card-title>
    </ion-item>
    <ion-item lines="none">
        <div class="form-text">Usage of the word in a sentence</div>
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
        getExamples(): string[] {
            this.examples = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.examples;
        },
        clear(): void {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.examples = [];
        },
    },
});
</script>

<style scoped></style>
