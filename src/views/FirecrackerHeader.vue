<template>
    <ion-header>
        <ion-toolbar>
            <ion-grid>
                <ion-row>
                    <ion-col size="12" class="firecracker-menu">
                        <ion-menu-button @click="onClickIcon">
                            <font-awesome-icon v-if="type === 'MENU'" :icon="faBars" />
                            <font-awesome-icon v-if="type === 'BACK'" :icon="faArrowLeft" />
                        </ion-menu-button>
                        <ion-title class="overflowed-content">{{ headerTitle }}</ion-title>
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
import { faBars, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
    props: {
        headerTitle: {
            type: String,
            required: true,
        },
        contentId: {
            type: String,
            required: true,
        },
        menuId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: false,
            default: 'MENU',
        },
    },
    data() {
        return {
            faBars,
            faArrowLeft,
        };
    },
    methods: {
        async openMenu(): Promise<void> {
            await (this.$refs.FirecrackerMenuRef as InstanceType<typeof FirecrackerMenu>).openMenu();
        },
        back(): void {
            // Something is wrong!
            this.$router.back();
        },
        async onClickIcon(): Promise<void> {
            if (this.type === 'MENU') {
                await this.openMenu();
            } else {
                this.back();
            }
        },
    },
});
</script>

<style scoped>
.firecracker-menu {
    display: flex;
}
</style>
