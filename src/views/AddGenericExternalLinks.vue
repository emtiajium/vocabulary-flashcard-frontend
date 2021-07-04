<template>
    <ion-item lines="none">
        <ion-card-title>Generic External Links</ion-card-title>
    </ion-item>
    <ion-item lines="none">
        <div class="form-text">Any external link can be inserted here</div>
    </ion-item>
    <view v-if="$props.existingGenericExternalLinks">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="existingGenericExternalLinks" />
    </view>
    <view v-if="!$props.existingGenericExternalLinks">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonCardTitle } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddGenericExternalLinks',
    components: {
        AddRemoveMultipleItems,
        IonCardTitle,
        IonItem,
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
