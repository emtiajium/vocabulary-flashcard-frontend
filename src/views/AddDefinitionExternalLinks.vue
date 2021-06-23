<template>
    <ion-item lines="none">
        <ion-label>External Links</ion-label>
    </ion-item>
    <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonLabel } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionExternalLinks',
    components: {
        AddRemoveMultipleItems,
        IonLabel,
        IonItem,
    },
    data() {
        return {
            externalLinks: [] as string[],
        };
    },
    methods: {
        getExternalLinks() {
            this.externalLinks = this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>;
            return this.externalLinks;
        },
        clear() {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.externalLinks = [];
        },
    },
});
</script>

<style scoped></style>
