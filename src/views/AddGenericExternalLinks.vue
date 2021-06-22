<template>
    <ion-item lines="none">
        <ion-label>Generic External Links</ion-label>
    </ion-item>
    <view v-for="(item, index) in itemsInGenericExternalLinks" :key="index">
        <ion-item>
            <ion-input
                type="url"
                :value="genericExternalLinks[index] || ''"
                @keyup="insertGenericExternalLink($event.target.value, index)"
            ></ion-input>
            <ion-button
                v-show="index === itemsInGenericExternalLinks.length - 1"
                color="success"
                @click="onAddMoreGenericExternalLink"
                >{{ getAddButtonLabel(genericExternalLinks.length) }}</ion-button
            >
            <ion-button
                v-show="index === itemsInGenericExternalLinks.length - 1"
                color="danger"
                @click="onRemoveLastGenericExternalLink(index)"
                >Remove</ion-button
            >
        </ion-item>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonInput, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { v4 as uuidV4 } from 'uuid';

export default defineComponent({
    name: 'AddGenericExternalLinks',
    components: {
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
    },
    data() {
        return {
            itemsInGenericExternalLinks: [uuidV4()],
            genericExternalLinks: [] as string[],
        };
    },
    methods: {
        getAddButtonLabel(itemsLength: number) {
            return itemsLength ? 'Add More' : 'Add';
        },
        insertGenericExternalLink(genericExternalLink: string, index: number) {
            this.genericExternalLinks[index] = genericExternalLink.trim();
        },
        onAddMoreGenericExternalLink() {
            this.itemsInGenericExternalLinks.push(uuidV4());
        },
        onRemoveLastGenericExternalLink(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInGenericExternalLinks.pop();
            }
            this.genericExternalLinks = this.genericExternalLinks.filter(
                (genericExternalLink, index) => index !== removableIndex,
            );
        },
        getGenericExternalLinks() {
            return this.genericExternalLinks.filter((genericExternalLink) => genericExternalLink.length > 0);
        },
        clear() {
            this.genericExternalLinks = [];
            this.itemsInGenericExternalLinks = [uuidV4()];
        },
    },
});
</script>

<style scoped></style>
