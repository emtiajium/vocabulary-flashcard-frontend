<template>
    <ion-header>
        <ion-toolbar>
            <ion-grid>
                <ion-row>
                    <ion-col size="12" class="display-flex">
                        <ion-menu-button v-if="type === 'MENU'" @click="onClickMenuIcon">
                            <font-awesome-icon :icon="faBars" />
                        </ion-menu-button>
                        <ion-button
                            v-if="type === 'BACK'"
                            color="white"
                            shape="round"
                            fill="clear"
                            class="back-icon"
                            @click="onClickBackIcon"
                        >
                            <font-awesome-icon :icon="faLongArrowAltLeft" />
                        </ion-button>
                        <ion-title v-if="!enableSearching" class="overflowed-content"> {{ headerTitle }} </ion-title>
                        <ion-searchbar
                            v-if="enableSearching"
                            mode="ios"
                            :placeholder="searchPlaceholder"
                            :value="searchKeyword"
                            @ionChange="debouncedOnChangeSearchKeyword"
                        />
                        <ion-button
                            v-if="enableSettings"
                            color="white"
                            size="small"
                            shape="round"
                            fill="clear"
                            class="settings-button"
                            @click="modifySettings"
                        >
                            <font-awesome-icon :icon="faEllipsisV" />
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-toolbar>
    </ion-header>
    <firecracker-menu ref="FirecrackerMenuRef" :content-id="contentId" :menu-id="menuId" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonMenuButton,
    IonSearchbar,
    IonButton,
} from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBars, faArrowLeft, faEllipsisV, faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons';
import FirecrackerMenu from '@/views/FirecrackerMenu.vue';
import * as _ from 'lodash';

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
    },
    data() {
        return {
            faBars,
            faArrowLeft,
            faEllipsisV,
            faLongArrowAltLeft,
            debouncedOnChangeSearchKeyword: (() => {
                // this block's purpose is to pacify es-lint
                // no-empty-function
            }) as ReturnType<typeof _.debounce>,
        };
    },
    mounted() {
        const oneSecondInMilliseconds = 1000;
        this.debouncedOnChangeSearchKeyword = _.debounce(this.onChangeSearchKeyword, oneSecondInMilliseconds);
    },
    methods: {
        async openMenu(): Promise<void> {
            await (this.$refs.FirecrackerMenuRef as InstanceType<typeof FirecrackerMenu>).openMenu();
        },
        onClickBackIcon(): void {
            this.$router.back();
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
    padding-right: unset;
}

.settings-button {
    font-size: 20px;
    --padding-start: 8px;
    --padding-end: 8px;
    width: 40px;
    height: 40px;
}

.back-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
}
</style>
