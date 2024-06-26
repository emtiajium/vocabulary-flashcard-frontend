<template>
    <ion-header class="margin-bottom-4">
        <ion-toolbar>
            <ion-row>
                <ion-col size="12" class="display-flex">
                    <ion-menu-button v-if="type === 'MENU'" aria-label="Menu" @click="onClickMenuIcon">
                        <font-awesome-icon :icon="faBars" />
                    </ion-menu-button>
                    <ion-button
                        v-if="['BACK', 'MANUAL_BACK'].includes(type)"
                        aria-label="Back to the previous page"
                        shape="round"
                        fill="clear"
                        class="back-icon"
                        @click="onClickBackIcon"
                    >
                        <font-awesome-icon :icon="faArrowLeft" />
                    </ion-button>
                    <ion-title v-if="!enableSearching" class="overflowed-content"> {{ headerTitle }} </ion-title>
                    <ion-searchbar
                        v-if="enableSearching"
                        mode="ios"
                        enterkeyhint="search"
                        :placeholder="searchPlaceholder"
                        :value="searchKeyword"
                        :debounce="1000"
                        :animated="true"
                        @ionInput="onChangeSearchKeyword"
                    />
                    <ion-button
                        v-if="enableSettings"
                        aria-label="Vocabulary settings preferences"
                        size="small"
                        shape="round"
                        fill="clear"
                        class="settings-button"
                        @click="modifySettings()"
                    >
                        <font-awesome-icon :icon="faEllipsisV" />
                    </ion-button>
                </ion-col>
            </ion-row>
        </ion-toolbar>
    </ion-header>
    <firecracker-menu ref="FirecrackerMenuRef" :content-id="contentId" :menu-id="menuId" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonMenuButton, IonSearchbar, IonButton } from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBars, faArrowLeft, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import FirecrackerMenu from '@/views/shared/FirecrackerMenu.vue';

export default defineComponent({
    name: 'FirecrackerHeader',
    components: {
        FirecrackerMenu,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonRow,
        IonCol,
        FontAwesomeIcon,
        IonMenuButton,
        IonSearchbar,
        IonButton,
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
        enableSettings: {
            type: Boolean,
            required: false,
            default: false,
        },
        modifySettings: {
            type: Function,
            required: false,
            default: (): void => {
                // do nothing
            },
        },
        manualBackIconHandler: {
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
            faEllipsisV,
        };
    },
    methods: {
        async openMenu(): Promise<void> {
            await (this.$refs.FirecrackerMenuRef as InstanceType<typeof FirecrackerMenu>).openMenu();
        },
        async onClickBackIcon(): Promise<void> {
            if (this.type === 'MANUAL_BACK') {
                await this.manualBackIconHandler();
            } else {
                this.$router.back();
            }
        },
        async onClickMenuIcon(): Promise<void> {
            await this.openMenu();
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

.settings-button {
    --padding-start: calc(var(--ion-padding) / 2);
    --padding-end: calc(var(--ion-padding) / 2);
    font-size: 1.25rem;
    width: 40px;
    height: 40px;
}

.back-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
}
</style>
