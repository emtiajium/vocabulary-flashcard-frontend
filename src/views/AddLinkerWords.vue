<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title> Relatable Words</ion-card-title>
            <ion-card-subtitle class="tips">
                <span class="material-icons"> tips_and_updates </span>
                <span class="info">
                    Any related vocabulary can be inserted here. And a relationship can have various aspects, for
                    example, it can be a synonym, an antonym, a homograph, a homonym, a homophone, etc. Therefore, if
                    the word is
                    <strong>Zenith</strong>, <strong>Pinnacle</strong> can be put here
                </span>
            </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="linkerWords" />
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddLinkerWords',
    components: {
        AddRemoveMultipleItems,
        IonCard,
        IonCardTitle,
        IonCardSubtitle,
        IonCardHeader,
        IonCardContent,
    },
    props: ['existingLinkerWords'],
    data() {
        return {
            linkerWords: (this.existingLinkerWords || []) as string[],
        };
    },
    methods: {
        getLinkerWords(): string[] {
            this.linkerWords = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.linkerWords;
        },
        clear(): void {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.linkerWords = [];
        },
    },
});
</script>

<style scoped></style>
