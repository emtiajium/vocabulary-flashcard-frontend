<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title>External Links</ion-card-title>
            <ion-card-subtitle>
                Any link can be inserted here, for example, if you found a new word while you were viewing a Quora post
                or a blog then you can put the link here
            </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <add-remove-multiple-items v-if="!$props.existingExternalLinks" ref="AddRemoveMultipleItemsRef" />
            <add-remove-multiple-items
                v-if="$props.existingExternalLinks"
                ref="AddRemoveMultipleItemsRef"
                :existing-items="existingExternalLinks"
            />
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionExternalLinks',
    components: {
        AddRemoveMultipleItems,
        IonCard,
        IonCardTitle,
        IonCardSubtitle,
        IonCardHeader,
        IonCardContent,
    },
    props: ['existingExternalLinks'],
    data() {
        return {
            externalLinks: [] as string[],
        };
    },
    methods: {
        getExternalLinks(): string[] {
            this.externalLinks = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.externalLinks;
        },
        clear(): void {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.externalLinks = [];
        },
    },
});
</script>

<style scoped></style>
