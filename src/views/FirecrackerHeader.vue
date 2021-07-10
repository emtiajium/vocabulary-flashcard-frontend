<template>
    <ion-header>
        <ion-toolbar>
            <ion-grid>
                <ion-row>
                    <ion-col size="12" class="display-flex">
                        <ion-menu-button @click="onClickIcon">
                            <font-awesome-icon v-if="type === 'MENU'" :icon="faBars" />
                            <font-awesome-icon v-if="type === 'BACK'" :icon="faArrowLeft" />
                        </ion-menu-button>
                        <ion-title v-if="!enableSearching" class="overflowed-content"> {{ headerTitle }} </ion-title>
                        <ion-searchbar
                            v-if="enableSearching"
                            mode="ios"
                            :placeholder="searchPlaceholder"
                            :value="searchKeyword"
                            @ionChange="onChangeSearchKeyword"
                        />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-toolbar>
    </ion-header>
    <firecracker-menu ref="FirecrackerMenuRef" :content-id="contentId" :menu-id="menuId" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonMenuButton, IonSearchbar } from '@ionic/vue';
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
        IonSearchbar,
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
        enableSearching: {
            type: Boolean,
            required: false,
            default: false,
        },
        searchKeyword: {
            type: String,
            required: false,
            default: '',
        },
        searchPlaceholder: {
            type: String,
            required: false,
            default: 'Search',
        },
        setSearchKeyword: {
            type: Function,
            required: false,
            default: (): void => {
                // do nothing
            },
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
        onChangeSearchKeyword($event: CustomEvent): void {
            this.setSearchKeyword($event.detail.value);
        },
    },
});
</script>

<style scoped>
ion-toolbar.sc-ion-searchbar-ios-h,
ion-toolbar .sc-ion-searchbar-ios-h {
    padding-top: unset;
    padding-bottom: unset;
}
</style>
