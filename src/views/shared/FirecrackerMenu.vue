<template>
    <ion-menu side="start" :menu-id="menuId" :content-id="contentId">
        <view class="container">
            <ion-grid class="display-grid">
                <div class="visually-hidden" role="status" aria-atomic="true">{{ loadingStatus }}</div>
                <ion-row v-if="isUserLoading" class="profile profile-skeleton" aria-hidden="true">
                    <skeleton-text width="120px" height="120px" border-radius="50%" />
                    <div class="profile-skeleton-text ion-padding-bottom">
                        <skeleton-text width="60%" height="var(--text-md)" />
                        <skeleton-text width="85%" height="var(--text-sm)" />
                    </div>
                </ion-row>

                <ion-row v-else-if="isUserLoadFailed" class="intro">
                    <p class="item-text">Unable to load profile</p>
                </ion-row>

                <ion-row v-else-if="isAuthenticated" class="profile">
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

                <ion-row v-else class="intro">
                    <img src="/assets/icon/firecracker-icon.svg" alt="Logo" width="100" />
                    <ion-title class="item-text"> <strong> Firecracker </strong> </ion-title>
                </ion-row>

                <ion-row>
                    <ion-list lines="none">
                        <template v-if="isUserLoading">
                            <ion-item v-for="index in 4" :key="index" aria-hidden="true">
                                <skeleton-text width="var(--icon-lg)" height="var(--icon-lg)" />
                                <ion-label class="ion-padding-start">
                                    <skeleton-text width="70%" height="var(--text-sm)" />
                                </ion-label>
                            </ion-item>
                        </template>
                        <ion-item v-if="showAuthenticatedMenu" button @click="navigate('/vocabularies')">
                            <font-awesome-icon :icon="faBook" class="menu-icon" />
                            <ion-label class="ion-padding-start"> Vocabularies </ion-label>
                        </ion-item>
                        <ion-item v-if="showAuthenticatedMenu" button @click="navigate('/leitner-systems')">
                            <flashcard-icon
                                :fill-color-variable="'--ion-color-primary'"
                                :stroke-color-variable="'--ion-color-primary'"
                                class="menu-icon"
                            />
                            <ion-label class="ion-padding-start"> My Flashcards </ion-label>
                        </ion-item>
                        <ion-item v-if="showAuthenticatedMenu" button @click="navigate('/guessing-game')">
                            <font-awesome-icon :icon="faBullseye" class="menu-icon" />
                            <ion-label class="ion-padding-start"> Guessing Word </ion-label>
                        </ion-item>
                        <ion-item v-if="showAuthenticatedMenu" button @click="navigate('/cohort/read')">
                            <font-awesome-icon :icon="faUsers" class="menu-icon" />
                            <ion-label class="ion-padding-start"> My Cohort </ion-label>
                        </ion-item>
                        <ion-item v-if="showGuestMenu" button @click="navigate('/sign-in')">
                            <font-awesome-icon :icon="faSignInAlt" class="menu-icon" />
                            <ion-label class="ion-padding-start"> Sign In </ion-label>
                        </ion-item>
                        <ion-item v-if="isUserLoadFailed" button @click="initUser">
                            <ion-label>Retry loading profile</ion-label>
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
                <ion-row v-if="!(showAuthenticatedMenu && !isAndroid)"></ion-row>
                <ion-row v-if="!(showAuthenticatedMenu && !isAndroid)"></ion-row>

                <ion-row v-if="showAuthenticatedMenu && !isAndroid">
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
                        <ion-item v-if="showAuthenticatedMenu" button @click="signOut">
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
import SkeletonText from '@/views/shared/SkeletonText.vue';
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
import HttpHandler from '@/utils/HttpHandler';
import User from '@/domains/User';

export default defineComponent({
    name: 'FirecrackerMenu',
    components: {
        SkeletonText,
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
            isUserLoading: true,
            isUserLoadFailed: false,
            isAndroid: true,
        };
    },
    async mounted() {
        await this.initUser();
        this.loadGetItOnGooglePlay().finally();
        this.setThemeStatus();
        this.observeThemeChange();
    },
    computed: {
        showAuthenticatedMenu(): boolean {
            return !this.isUserLoading && !this.isUserLoadFailed && this.isAuthenticated;
        },
        showGuestMenu(): boolean {
            return !this.isUserLoading && !this.isUserLoadFailed && !this.isAuthenticated;
        },
        loadingStatus(): string {
            if (this.isUserLoading) {
                return 'Loading profile';
            }
            if (this.isUserLoadFailed) {
                return 'Unable to load profile';
            }
            if (this.isAuthenticated) {
                return 'Profile loaded';
            }
            return 'Guest menu ready';
        },
    },
    methods: {
        async initUser(): Promise<void> {
            this.isUserLoading = true;
            this.isUserLoadFailed = false;
            try {
                const user = await HttpHandler.get<User>('/v1/users/self');

                if (!user) {
                    this.isAuthenticated = false;
                    await NativeStorage.setIsAuthenticated(false);
                    return;
                }

                this.profilePictureUrl =
                    user.profilePictureUrl ||
                    'https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y';

                this.username = user.username as string;
                this.name = user.name as string;
                this.isAuthenticated = true;

                await NativeStorage.setIsAuthenticated(true);
            } catch (error) {
                const { status } = error as Error & { status?: number };

                if (status === 401) {
                    this.isAuthenticated = false;
                    await NativeStorage.setIsAuthenticated(false);
                } else {
                    this.isUserLoadFailed = true;
                }
            } finally {
                this.isUserLoading = false;
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
            // try to close the menu again that remained opened for unknown reason
            this.closeMenu().finally();
        },
        async signOut(): Promise<void> {
            try {
                await HttpHandler.post<void, void>('/v1/auth/logout', undefined);
            } catch (error) {
                void error;
            } finally {
                await Promise.allSettled([
                    NativeStorage.removeGoodBye(),
                    GoogleAuthentication.signOut(),
                    NativeStorage.setIsAuthenticated(false),
                ]);
            }
            await this.closeMenu();
            this.isAuthenticated = false;
            await Toast.present(
                `You have been signed out successfully. Thanks for using Firecracker Vocabulary Flashcards. We hope to see you again soon.`,
                'success',
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
    background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
    align-items: center;
    padding-top: var(--ion-padding);
    padding-bottom: var(--ion-padding);
}
.profile {
    background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    padding-bottom: var(--space-md);
}
.profile-skeleton {
    gap: var(--space-sm);
}
.profile-skeleton :deep(ion-skeleton-text) {
    --background: rgba(var(--ion-color-primary-contrast-rgb), 0.4);
    --background-rgb: var(--ion-color-primary-contrast-rgb);
}
.profile-skeleton-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    width: 100%;
}
.profile img {
    border: 1px solid var(--app-border-color);
    box-shadow: var(--shadow-md);
}
.item-text {
    color: var(--ion-color-primary-contrast);
}
ion-list {
    width: 100%;
    background: transparent;
    padding: var(--space-xs);
}
ion-item {
    --background: transparent;
    --background-hover: var(--ion-color-primary);
    --background-hover-opacity: 0.12;
    --background-activated: var(--ion-color-primary);
    --background-activated-opacity: 0.2;
    --border-radius: var(--radius-md);
    --min-height: 48px;
    --padding-start: var(--space-sm);
    --inner-padding-end: var(--space-sm);
    margin-bottom: var(--space-2xs);
    font-weight: var(--font-weight-medium);
}
.menu-icon {
    color: var(--ion-color-primary);
    width: var(--icon-lg);
    height: var(--icon-lg);
}
.google-play {
    width: 60%;
}
</style>
