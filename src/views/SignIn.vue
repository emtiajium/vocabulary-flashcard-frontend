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
                    <ion-row class="ion-justify-content-center">
                        <ion-button @click="handleClick">
                            <font-awesome-icon :icon="faGoogle" />
                            <ion-text class="ion-padding-start"> Continue with Google </ion-text>
                        </ion-button>
                    </ion-row>
                    <ion-row class="ion-justify-content-center ion-padding">
                        <ion-text class="privacy-text">
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
import { IonContent, IonPage, IonText, IonButton, IonGrid, IonRow, useBackButton } from '@ionic/vue';
import { defineComponent } from 'vue';
import GoogleAuth from '@/utils/GoogleAuthorization';
import User from '@/domains/User';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import NativeStorage from '@/utils/NativeStorage';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import MessageDB from '@/utils/MessageDB';
import BackButtonHandlerPriority from '@/domains/BackButtonHandlerPriority';
import { App } from '@capacitor/app';
import * as _ from 'lodash';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import Alert from '@/utils/Alert';
import Intro from '@/views/Intro.vue';
import Platform from '@/utils/Platform';

export default defineComponent({
    name: 'SignIn',
    components: {
        FirecrackerHeader,
        Intro,
        IonContent,
        IonPage,
        IonText,
        IonButton,
        FontAwesomeIcon,
        IonGrid,
        IonRow,
    },
    setup() {
        useBackButton(BackButtonHandlerPriority.SIGN_IN, () => {
            App.exitApp();
        });
    },
    async mounted() {
        await GoogleAuth.load();
        await this.loadGetItOnGooglePlay().finally();
    },
    data() {
        return { isAndroid: true, faGoogle };
    },
    methods: {
        async handleClick(): Promise<void> {
            await Alert.presentAlertConfirm(
                '',
                `"Firecracker Vocabulary Flashcards" will collect your name, email address and photo after Google authentication.`,
                async () => {
                    return this.handleSignIn();
                },
                async () => {
                    return true;
                },
                {
                    cancel: 'Deny',
                    agree: 'Accept',
                },
            );
        },
        async handleSignIn(): Promise<void> {
            try {
                const user = await GoogleAuth.signIn();
                await this.persistUser(user);
                await this.$router.replace('/authenticated-home');
            } catch (error) {
                if (error.error && ['popup_closed_by_user', 'access_denied'].includes(error.error)) {
                    // https://developers.google.com/identity/sign-in/web/reference
                } else {
                    await Toast.present(MessageDB.networkError);
                }
            }
        },
        async persistUser(googleUser: User): Promise<void> {
            const persistedUser = await HttpHandler.post<User, User>(`/v1/users`, _.omit(googleUser, 'jwToken'), true);
            await NativeStorage.setAuthorizedUser({ ...persistedUser, jwToken: googleUser.jwToken } as User);
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
.display-grid {
    display: grid;
}
.privacy-text {
    text-align: center;
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
