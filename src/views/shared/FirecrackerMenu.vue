<template>
    <ion-menu side="start" :menu-id="menuId" :content-id="contentId">
        <view class="container">
            <ion-grid class="display-grid">
                <ion-row v-if="isAuthenticated" class="profile">
                    <img
                        :src="profilePictureUrl"
                        :alt="`${name}'s avatar`"
                        class="rounded-circle ion-padding"
                        width="120"
                    />
                    <div class="ion-padding-bottom">
                        <strong class="display-flex ion-justify-content-center item-text ion-text-capitalize">
                            {{ name }}
                        </strong>
                        <span class="item-text"> {{ username }} </span>
                    </div>
                </ion-row>

                <ion-row v-if="!isAuthenticated" class="intro">
                    <img src="/assets/icon/firecracker-icon.png" alt="Logo" width="100" />
                    <ion-title class="item-text"> <strong> Firecracker </strong> </ion-title>
                </ion-row>

                <ion-row>
                    <ion-list lines="none">
                        <ion-item v-if="isAuthenticated" button @click="navigate('/vocabularies')">
                            <font-awesome-icon :icon="faBook" class="menu-icon" />
                            <ion-label class="ion-padding-start"> Vocabularies </ion-label>
                        </ion-item>
                        <ion-item v-if="isAuthenticated" button @click="navigate('/leitner-systems')">
                            <flashcard-icon
                                :fill-color-variable="'--ion-color-primary'"
                                :stroke-color-variable="'--ion-color-primary'"
                                class="menu-icon"
                            />
                            <ion-label class="ion-padding-start"> My Flashcards </ion-label>
                        </ion-item>
                        <ion-item v-if="isAuthenticated" button @click="navigate('/guessing-game')">
                            <font-awesome-icon :icon="faBullseye" class="menu-icon" />
                            <ion-label class="ion-padding-start"> Guessing Word </ion-label>
                        </ion-item>
                        <ion-item v-if="isAuthenticated" button @click="navigate('/cohort/read')">
                            <font-awesome-icon :icon="faUsers" class="menu-icon" />
                            <ion-label class="ion-padding-start"> My Cohort </ion-label>
                        </ion-item>
                        <ion-item v-if="!isAuthenticated" button @click="navigate('/sign-in')">
                            <font-awesome-icon :icon="faSignInAlt" class="menu-icon" />
                            <ion-label class="ion-padding-start"> Sign In </ion-label>
                        </ion-item>
                        <ion-item button @click="navigate('/privacy-policy')">
                            <policy-icon
                                class="menu-icon"
                                :fill-color-variable="'--ion-color-primary'"
                                :stroke-color-variable="'--ion-item-background'"
                            />
                            <ion-label class="ion-padding-start"> Privacy Policy </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-row>

                <!-- dummy elements to resolve height issue; it looks uglier without those -->
                <ion-row v-if="!(isAuthenticated && !isAndroid)"></ion-row>
                <ion-row v-if="!(isAuthenticated && !isAndroid)"></ion-row>

                <ion-row v-if="isAuthenticated && !isAndroid">
                    <ion-list lines="none">
                        <ion-item class="display-flex ion-align-items-end">
                            <a
                                href="https://play.google.com/store/apps/details?id=com.emtiajium.firecracker.collaborative.vocab.practice&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
                                target="_blank"
                                class="display-flex ion-justify-content-center"
                            >
                                <img
                                    alt="Get it on Google Play"
                                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                                    class="google-play"
                                />
                            </a>
                        </ion-item>
                    </ion-list>
                </ion-row>

                <ion-row class="ion-align-items-end">
                    <ion-list lines="none">
                        <ion-item button @click="toggleTheme()">
                            <light-mode-icon
                                v-if="!isDark"
                                class="menu-icon"
                                :fill-color-variable="'--ion-color-primary'"
                                :stroke-color-variable="'--ion-color-primary'"
                            />
                            <font-awesome-icon v-if="isDark" :icon="faMoon" class="menu-icon" />
                            <ion-label class="ion-padding-start">
                                Switch to {{ isDark ? 'Light' : 'Dark' }} Theme
                            </ion-label>
                        </ion-item>
                        <ion-item v-if="isAuthenticated" button @click="signOut">
                            <font-awesome-icon :icon="faSignOutAlt" class="menu-icon" />
                            <ion-label class="ion-padding-start"> Sign Out </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-row>
            </ion-grid>
        </view>
    </ion-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonItem, IonList, IonMenu, menuController, IonLabel, IonTitle, IonGrid, IonRow } from '@ionic/vue';
import NativeStorage from '@/utils/NativeStorage';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faUsers, faSignInAlt, faSignOutAlt, faMoon, faBullseye } from '@fortawesome/free-solid-svg-icons';
import { isModeDark, setThemeMode } from '@/utils/dark-mode';
import FlashcardIcon from '@/media/FlashcardIcon.vue';
import Platform from '@/utils/Platform';
import GoogleAuthentication from '@/utils/GoogleAuthentication';
import PolicyIcon from '@/media/PolicyIcon.vue';
import LightModeIcon from '@/media/LightModeIcon.vue';
import Toast from '@/utils/Toast';

export default defineComponent({
    name: 'FirecrackerMenu',
    components: {
        LightModeIcon,
        PolicyIcon,
        FlashcardIcon,
        IonItem,
        IonList,
        IonMenu,
        IonLabel,
        FontAwesomeIcon,
        IonTitle,
        IonGrid,
        IonRow,
    },
    props: ['contentId', 'menuId'],
    data() {
        return {
            profilePictureUrl: '',
            username: '',
            name: '',
            faBook,
            faBullseye,
            faUsers,
            faSignInAlt,
            faSignOutAlt,
            faMoon,
            isDark: false,
            isAuthenticated: false,
            isAndroid: true,
        };
    },
    async mounted() {
        await this.initUser();
        this.loadGetItOnGooglePlay().finally();
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
        async loadGetItOnGooglePlay(): Promise<void> {
            this.isAndroid = await Platform.isAndroid();
        },
        async openMenu(): Promise<void> {
            await menuController.open(this.menuId);
        },
        async closeMenu(): Promise<void> {
            await menuController.close();
        },
        async navigate(url: string): Promise<void> {
            await this.closeMenu();
            await this.$router.push(url);
        },
        async signOut(): Promise<void> {
            await NativeStorage.removeGoodBye();
            await NativeStorage.removeAuthorizedUser();
            await NativeStorage.removeGuessingGameVocabularies();
            await GoogleAuthentication.signOut();
            await this.closeMenu();
            this.isAuthenticated = false;
            await Toast.present(
                `You have been signed out successfully. Thanks for using Firecracker Vocabulary Flashcards. We hope to see you again soon.`,
            );
            await this.$router.replace('/sign-in');
        },
        setThemeStatus(): void {
            this.isDark = isModeDark();
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
        toggleTheme(): void {
            setThemeMode(!this.isDark ? 'dark' : 'light');
        },
    },
});
</script>

<style scoped>
.container {
    height: 100%;
    display: flex;
    overflow-y: auto;
}
.container > ion-grid {
    padding-inline-start: unset;
    padding-inline-end: unset;
    padding-top: unset;
    padding-bottom: unset;
}
.intro {
    background-color: var(--ion-toolbar-background);
    align-items: center;
    padding-top: var(--ion-padding);
    padding-bottom: var(--ion-padding);
}
.profile {
    background-color: var(--ion-toolbar-background);
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
}
.item-text {
    color: var(--ion-toolbar-color);
}
ion-list {
    width: 100%;
}
.menu-icon {
    color: var(--ion-color-primary);
    width: 25px;
}
.google-play {
    width: 60%;
}
</style>
