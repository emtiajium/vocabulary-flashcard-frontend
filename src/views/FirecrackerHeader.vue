<template>
    <ion-header>
        <ion-toolbar>
            <ion-grid>
                <ion-row>
                    <ion-col size="12" class="firecracker-menu">
                        <ion-menu-button @click="toggleMenu">
                            <font-awesome-icon :icon="faBars" />
                        </ion-menu-button>
                        <ion-title>{{ headerTitle }}</ion-title>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-toolbar>
    </ion-header>
    <firecracker-menu ref="FirecrackerMenuRef" :content-id="contentId" :menu-id="menuId" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonMenuButton } from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import FirecrackerMenu from '@/views/FirecrackerMenu.vue';

export default defineComponent({
    name: 'FirecrackerHeader',
    components: {
        FirecrackerMenu,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonGrid,
        IonRow,
        IonCol,
        FontAwesomeIcon,
        IonMenuButton,
    },
    props: ['headerTitle', 'contentId', 'menuId'],
    data() {
        return {
            faBars,
        };
    },
    methods: {
        toggleMenu() {
            (this.$refs.FirecrackerMenuRef as InstanceType<typeof FirecrackerMenu>).toggleMenu();
        },
    },
});
</script>

<style scoped>
.firecracker-menu {
    display: flex;
}
</style>
