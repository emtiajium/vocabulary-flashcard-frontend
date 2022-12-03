<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title> Generic External Links </ion-card-title>
            <ion-card-subtitle class="tips">
                <span class="material-icons"> tips_and_updates </span>
                <span class="info"> Any external link can be inserted here </span>
            </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <add-remove-multiple-items
                ref="AddRemoveMultipleItemsRef"
                :existing-items="existingGenericExternalLinks"
                :item-class="'vocab-upsert-item'"
            />
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/vocab-upsert/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddGenericExternalLinks',
    components: {
        AddRemoveMultipleItems,
        IonCard,
        IonCardTitle,
        IonCardSubtitle,
        IonCardHeader,
        IonCardContent,
    },
    props: ['existingGenericExternalLinks'],
    data() {
        return {
            genericExternalLinks: (this.existingGenericExternalLinks || []) as string[],
        };
    },
    methods: {
        getGenericExternalLinks(): string[] {
            this.genericExternalLinks = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.genericExternalLinks;
        },
        clear(): void {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.genericExternalLinks = [];
        },
    },
});
</script>

<style scoped></style>
