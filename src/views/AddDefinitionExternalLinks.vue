<template>
    <ion-item lines="none">
        <ion-label>External Links</ion-label>
    </ion-item>
    <view v-if="!$props.existingExternalLinks">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
    <view v-if="$props.existingExternalLinks">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="existingExternalLinks" />
    </view>
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
    props: ['existingExternalLinks'],
    data() {
        return {
            externalLinks: [] as string[],
        };
    },
    methods: {
        getExternalLinks() {
            this.externalLinks = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
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
