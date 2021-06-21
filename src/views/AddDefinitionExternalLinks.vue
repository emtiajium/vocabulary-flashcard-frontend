<template>
    <ion-item lines="none">
        <ion-label>External Links</ion-label>
    </ion-item>
    <div v-for="(item, index) in itemsInExternalLinks" :key="index">
        <ion-item>
            <ion-input
                type="url"
                :value="externalLinks[index] || ''"
                @keyup="insertExternalLink($event.target.value, index)"
            ></ion-input>
            <ion-button v-show="index === itemsInExternalLinks.length - 1" @click="onAddMoreExternalLink"
                >Add More</ion-button
            >
            <ion-button v-show="index === itemsInExternalLinks.length - 1" @click="onRemoveLastExternalLink(index)"
                >Remove</ion-button
            >
        </ion-item>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonInput, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { v4 as uuidV4 } from 'uuid';

export default defineComponent({
    name: 'AddDefinitionExternalLinks',
    components: {
        IonInput,
        IonLabel,
        IonItem,
        IonButton,
    },
    data() {
        return {
            itemsInExternalLinks: [uuidV4()],
            externalLinks: [] as string[],
        };
    },
    methods: {
        insertExternalLink(externalLink: string, index: number) {
            this.externalLinks[index] = externalLink;
        },
        onAddMoreExternalLink() {
            this.itemsInExternalLinks.push(uuidV4());
        },
        onRemoveLastExternalLink(removableIndex: number) {
            if (removableIndex !== 0) {
                this.itemsInExternalLinks.pop();
            }
            this.externalLinks = this.externalLinks.filter((externalLink, index) => index !== removableIndex);
        },
        getExternalLinks() {
            return this.externalLinks.filter((externalLink) => externalLink.trim().length > 0);
        },
    },
});
</script>

<style scoped></style>
