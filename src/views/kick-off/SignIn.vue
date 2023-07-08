<template>
    <ion-page>
        <firecracker-header
            type="MENU"
            header-title="Firecracker Vocab Flashcards"
            content-id="sign-in"
            menu-id="sign-in-menu"
        />

        <ion-content :fullscreen="true" id="sign-in">
            <view class="container">
                <ion-grid class="display-grid">
                    <ion-row class="ion-justify-content-center">
                        <intro />
                    </ion-row>
                    <ion-row class="ion-justify-content-center ion-padding">
                        <div v-if="isAndroid" @click="handleClick">
                            <continue-with-google />
                        </div>
                        <div v-show="!isAndroid" id="google-sign-in"></div>
                    </ion-row>
                    <ion-row class="ion-justify-content-center ion-padding">
                        <ion-text class="ion-text-center">
                            By creating your account, you agree with our
                            <router-link to="/privacy-policy"> Privacy Policy </router-link>
                        </ion-text>
                    </ion-row>
                    <ion-row v-if="!isAndroid" class="ion-align-items-end ion-justify-content-center">
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
                    </ion-row>
                </ion-grid>
            </view>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, IonText, IonGrid, IonRow, useBackButton } from '@ionic/vue';
import { defineComponent } from 'vue';
import GoogleAuthentication from '@/utils/GoogleAuthentication';
import User from '@/domains/User';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import NativeStorage from '@/utils/NativeStorage';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import MessageDB from '@/utils/MessageDB';
import BackButtonHandlerPriority from '@/domains/BackButtonHandlerPriority';
import { App } from '@capacitor/app';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import Alert from '@/utils/Alert';
import Intro from '@/views/kick-off/Intro.vue';
import Platform from '@/utils/Platform';
import ContinueWithGoogle from '@/views/kick-off/ContinueWithGoogle.vue';

export default defineComponent({
    name: 'SignIn',
    components: {
        FirecrackerHeader,
        ContinueWithGoogle,
        Intro,
        IonContent,
        IonPage,
        IonText,
        IonGrid,
        IonRow,
    },
    setup() {
        useBackButton(BackButtonHandlerPriority.SIGN_IN, async () => {
            await App.exitApp();
        });
    },
    async mounted() {
        await GoogleAuthentication.load('google-sign-in', this.handleClick);
        this.loadGetItOnGooglePlay().finally();
    },
    data() {
        return { isAndroid: true, faGoogle };
    },
    methods: {
        // eslint-disable-next-line consistent-return
        async handleClick(): Promise<void> {
            if ((await NativeStorage.getGoodBye()) === 'okay!') {
                return this.handleSignIn();
            }

            await Alert.presentAlertConfirm(
                '',
                `"Firecracker Vocabulary Flashcards" will collect your name, email address, and photo.`,
                () => {
                    return this.handleSignIn();
                },
                async () => {
                    if (!this.isAndroid) {
                        await GoogleAuthentication.signOut();
                    }
                },
                {
                    cancel: 'Deny',
                    agree: 'Proceed',
                },
            );
        },
        async handleSignIn(): Promise<void> {
            try {
                if (this.isAndroid) {
                    await GoogleAuthentication.androidSignIn();
                }
                if ((await NativeStorage.getGoodBye()) === 'okay!') {
                    await this.$router.replace('/goodbye');
                } else {
                    const { user } = GoogleAuthentication;
                    await this.persistUser(user);
                    await this.$router.replace('/authenticated-home');
                }
            } catch (error) {
                if (error.error && ['popup_closed_by_user', 'access_denied'].includes(error.error)) {
                    // https://developers.google.com/identity/sign-in/web/reference
                } else {
                    await Toast.present(MessageDB.networkError);
                }
            }
        },
        async persistUser(user: User): Promise<void> {
            // TODO stop sending payload
            // as it is valueless due to the fact that the payload will be generated from the token
            const persistedUser = await HttpHandler.post<User, User>(`/v1/users`, user);
            await NativeStorage.setAuthorizedUser(persistedUser);
        },
        async loadGetItOnGooglePlay(): Promise<void> {
            this.isAndroid = await Platform.isAndroid();
        },
    },
});
</script>

<style scoped>
.container {
    height: 100%;
    display: flex;
}
.google-play {
    width: 50%;
}
@media only screen and (min-width: 480px) {
    .google-play {
        width: 30%;
    }
}
</style>
