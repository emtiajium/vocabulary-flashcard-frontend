<template>
    <ion-item lines="none">
        <ion-card-title>External Links</ion-card-title>
    </ion-item>
    <ion-item lines="none">
        <div class="form-text">
            Any link can be inserted here, for example, if you found a new word while you were viewing a Quora post or a
            blog then you can put the link here
        </div>
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
import { IonItem, IonCardTitle } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddDefinitionExternalLinks',
    components: {
        AddRemoveMultipleItems,
        IonCardTitle,
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
