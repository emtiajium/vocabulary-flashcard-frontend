<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title>Examples</ion-card-title>
            <ion-card-subtitle>Usage of the word in a sentence</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <add-remove-multiple-items v-if="!$props.existingExamples" ref="AddRemoveMultipleItemsRef" />
            <add-remove-multiple-items
                v-if="$props.existingExamples"
                ref="AddRemoveMultipleItemsRef"
                :existing-items="existingExamples"
            />
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionExample',
    components: {
        AddRemoveMultipleItems,
        IonCard,
        IonCardTitle,
        IonCardSubtitle,
        IonCardHeader,
        IonCardContent,
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
