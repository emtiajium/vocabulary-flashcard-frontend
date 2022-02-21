<template>
    <ion-menu side="start" :menu-id="menuId" :content-id="contentId">
        <ion-content>
            <div v-if="isAuthenticated" class="profile ion-padding-bottom">
                <img :src="profilePictureUrl" alt="Avatar" class="rounded-circle ion-padding" width="100" />
                <div class="ion-padding-start">
                    <strong class="item-text ion-text-capitalize"> {{ name }} </strong>
                    <br />
                    <span class="ion-padding-top item-text"> {{ username }} </span>
                </div>
            </div>
            <div v-if="!isAuthenticated" class="intro">
                <img src="/assets/icon/firecracker-icon.png" alt="Logo" width="100" />
                <div class="app-name">
                    <strong class="item-text ion-text-capitalize"> Firecracker </strong>
                    <strong class="item-text ion-text-capitalize"> Vocab Practice </strong>
                </div>
            </div>
            <ion-list lines="none">
                <ion-item v-if="isAuthenticated" button @click="navigate('/vocabularies')">
                    <font-awesome-icon :icon="faBook" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Vocabularies </ion-label>
                </ion-item>
                <ion-item v-if="isAuthenticated" button @click="navigate('/cohort/read')">
                    <font-awesome-icon :icon="faUsers" class="menu-icon" />
                    <ion-label class="ion-padding-start"> My Cohort </ion-label>
                </ion-item>
                <ion-item v-if="isAuthenticated" button @click="navigate('/leitner-systems')">
                    <font-awesome-icon :icon="faBoxOpen" class="menu-icon" />
                    <ion-label class="ion-padding-start"> My Flashcards </ion-label>
                </ion-item>
                <ion-item v-if="isAuthenticated">
                    <span v-if="!isDark" class="material-icons menu-icon"> light_mode </span>
                    <font-awesome-icon v-if="isDark" :icon="faMoon" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Switch to {{ isDark ? 'Light' : 'Dark' }} Theme </ion-label>
                    <ion-toggle slot="end" :checked="isDark" @ionChange="onChangeThemeMode($event.detail.checked)" />
                </ion-item>
                <ion-item button @click="navigate('/privacy-policy')">
                    <span class="material-icons menu-icon"> policy </span>
                    <ion-label class="ion-padding-start"> Privacy Policy </ion-label>
                </ion-item>
                <ion-item v-if="!isAuthenticated" button @click="navigate('/sign-in')">
                    <font-awesome-icon :icon="faSignInAlt" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Sign In </ion-label>
                </ion-item>
                <ion-item v-if="!isAuthenticated">
                    <span v-if="!isDark" class="material-icons menu-icon"> light_mode </span>
                    <font-awesome-icon v-if="isDark" :icon="faMoon" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Switch to {{ isDark ? 'Light' : 'Dark' }} Theme </ion-label>
                    <ion-toggle slot="end" :checked="isDark" @ionChange="onChangeThemeMode($event.detail.checked)" />
                </ion-item>
                <ion-item v-if="isAuthenticated" button @click="signOut">
                    <font-awesome-icon :icon="faSignOutAlt" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Sign Out </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonItem, IonList, IonMenu, menuController, IonLabel, IonToggle } from '@ionic/vue';
import NativeStorage from '@/utils/NativeStorage';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faUsers, faSignInAlt, faSignOutAlt, faMoon, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { getThemeMode, setThemeMode } from '@/utils/dark-mode';

export default defineComponent({
    name: 'FirecrackerMenu',
    components: {
        IonContent,
        IonItem,
        IonList,
        IonMenu,
        IonLabel,
        FontAwesomeIcon,
        IonToggle,
    },
    props: ['contentId', 'menuId'],
    data() {
        return {
            profilePictureUrl: '',
            username: '',
            name: '',
            faBook,
            faUsers,
            faSignInAlt,
            faSignOutAlt,
            faMoon,
            isDark: false,
            faBoxOpen,
            isAuthenticated: false,
        };
    },
    async mounted() {
        await this.initUser();
        this.setThemeStatus();
        this.observeThemeChange();
    },
    methods: {
        async initUser(): Promise<void> {
            const user = await NativeStorage.getAuthorizedUser();
            if (user) {
                this.profilePictureUrl =
                    user.profilePictureUrl ||
                    `https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y`;
                this.username = user.username as string;
                this.name = user.name as string;
                this.isAuthenticated = true;
            }
        },
        async openMenu(): Promise<void> {
            await menuController.enable(true, this.menuId);
            await menuController.open(this.menuId);
        },
        async closeMenu(): Promise<void> {
            if (await menuController.isOpen()) {
                await menuController.close(this.menuId);
            }
        },
        async navigate(url: string): Promise<void> {
            await this.closeMenu();
            await this.$router.push(url);
        },
        async signOut(): Promise<void> {
            await NativeStorage.removeAuthorizedUser();
            await menuController.close();
            this.isAuthenticated = false;
            await this.$router.replace('/sign-in');
        },
        setThemeStatus(): void {
            const mode = getThemeMode();
            this.isDark = mode.includes('dark');
        },
        observeThemeChange(): void {
            const targetNode = document.body;

            const config = { attributes: true, attributeFilter: ['class'] };

            const callback = (mutationsRecords: MutationRecord[]): void => {
                mutationsRecords.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                        this.setThemeStatus();
                    }
                });
            };

            const observer = new MutationObserver(callback);

            observer.observe(targetNode, config);
        },
        onChangeThemeMode(isDark: boolean): void {
            setThemeMode(isDark ? 'dark' : 'light');
        },
    },
});
</script>

<style scoped>
.intro {
    background-color: var(--ion-color-primary);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.app-name {
    display: flex;
    flex-direction: column;
}
.profile {
    background-color: var(--ion-color-primary);
}
.item-text {
    color: var(--ion-color-white);
}
.menu-icon {
    color: var(--ion-color-primary);
    width: 25px;
}
</style>
