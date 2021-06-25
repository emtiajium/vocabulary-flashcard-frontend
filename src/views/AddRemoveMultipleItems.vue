<template>
    <view v-for="(item, index) in placeholderItems" :key="index">
        <ion-item>
            <ion-input
                type="text"
                :value="items[index] || ''"
                @keyup="insertItem($event.target.value, index)"
            ></ion-input>
            <ion-button
                v-show="items.length > 0 && index === placeholderItems.length - 1 && items[index]?.length > 0"
                color="success"
                @click="onAddMoreItem"
                >Add More</ion-button
            >
            <ion-button
                v-show="items.length > 0 && items[index]?.length > 0"
                color="danger"
                @click="onRemoveLastItem(index)"
                >Remove</ion-button
            >
        </ion-item>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonInput, IonItem, IonButton } from '@ionic/vue';
import { v4 as uuidV4 } from 'uuid';
import * as _ from 'lodash';

export default defineComponent({
    name: 'AddRemoveMultipleItems',
    components: {
        IonInput,
        IonItem,
        IonButton,
    },
    props: ['existingItems'],
    data() {
        const placeholderItems = _.fill(_.times(this.existingItems?.length || 1), uuidV4());
        return {
            placeholderItems,
            items: (this.existingItems || []) as string[],
        };
    },
    methods: {
        insertItem(item: string, index: number) {
            if (!item) {
                this.removeItem(index);
            } else {
                this.items[index] = item.trim();
            }
        },
        onAddMoreItem() {
            this.placeholderItems.push(uuidV4());
        },
        removeItem(removableIndex: number) {
            this.items = this.items.filter((word, index) => index !== removableIndex);
        },
        onRemoveLastItem(removableIndex: number) {
            if (removableIndex !== 0) {
                this.placeholderItems.pop();
            }
            this.removeItem(removableIndex);
        },
        getItems() {
            return this.items.filter((item) => item.length > 0);
        },
        clear() {
            this.items = [];
            this.placeholderItems = [uuidV4()];
        },
    },
});
</script>

<style scoped></style>
