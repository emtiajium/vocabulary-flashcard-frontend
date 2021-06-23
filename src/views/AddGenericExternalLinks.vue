<template>
    <ion-item lines="none">
        <ion-label>Generic External Links</ion-label>
    </ion-item>
    <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonLabel } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddGenericExternalLinks',
    components: {
        AddRemoveMultipleItems,
        IonLabel,
        IonItem,
    },
    data() {
        return {
            genericExternalLinks: [] as string[],
        };
    },
    methods: {
        getGenericExternalLinks() {
            this.genericExternalLinks = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.genericExternalLinks;
        },
        clear() {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.genericExternalLinks = [];
        },
    },
});
</script>

<style scoped></style>
