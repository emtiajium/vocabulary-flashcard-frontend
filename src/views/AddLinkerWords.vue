<template>
    <ion-item lines="none">
        <ion-card-title>Linker Words</ion-card-title>
    </ion-item>
    <ion-item lines="none">
        <div class="form-text">
            Any related vocabulary can be inserted here. For example, if the word is <strong>Zenith</strong>, I can put
            <strong>Pinnacle</strong> here
        </div>
    </ion-item>
    <view v-if="$props.existingLinkerWords">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" :existing-items="linkerWords" />
    </view>
    <view v-if="!$props.existingLinkerWords">
        <add-remove-multiple-items ref="AddRemoveMultipleItemsRef" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonCardTitle } from '@ionic/vue';
import AddRemoveMultipleItems from '@/views/AddRemoveMultipleItems.vue';

export default defineComponent({
    name: 'AddLinkerWords',
    components: {
        AddRemoveMultipleItems,
        IonCardTitle,
        IonItem,
    },
    props: ['existingLinkerWords'],
    data() {
        return {
            linkerWords: (this.existingLinkerWords || []) as string[],
        };
    },
    methods: {
        getLinkerWords() {
            this.linkerWords = (
                this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>
            ).getItems();
            return this.linkerWords;
        },
        clear() {
            (this.$refs.AddRemoveMultipleItemsRef as InstanceType<typeof AddRemoveMultipleItems>).clear();
            this.linkerWords = [];
        },
    },
});
</script>

<style scoped></style>
