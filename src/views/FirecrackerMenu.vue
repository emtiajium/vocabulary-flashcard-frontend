<template>
    <ion-menu side="start" :menu-id="menuId" :content-id="contentId">
        <ion-content>
            <ion-list>
                <ion-item>Menu Item</ion-item>
                <ion-item>Menu Item</ion-item>
                <ion-item>Menu Item</ion-item>
                <ion-item>Menu Item</ion-item>
                <ion-item>Menu Item</ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonItem, IonList, IonMenu, menuController } from '@ionic/vue';

export default defineComponent({
    name: 'FirecrackerMenu',
    components: {
        IonContent,
        IonItem,
        IonList,
        IonMenu,
    },
    props: ['contentId', 'menuId'],
    methods: {
        toggleMenu() {
            menuController.enable(true, this.menuId);
            menuController.open(this.menuId);
        },
    },
});
</script>

<style scoped></style>
