<template>
    <ion-page>
        <firecracker-header
            type="MENU"
            header-title="Firecracker Vocab Practice"
            content-id="sign-in"
            menu-id="sign-in-menu"
        />

        <ion-content :fullscreen="true" id="sign-in">
            <view class="container">
                <ion-grid class="display-grid ion-align-items-center">
                    <ion-row class="ion-justify-content-center">
                        <img src="/assets/icon/icon.png" alt="Logo" class="logo-extra" />
                    </ion-row>
                    <ion-row class="ion-justify-content-center">
                        <ion-button @click="handleClick">
                            <font-awesome-icon :icon="faGoogle" />
                            <ion-text class="ion-padding-start"> Continue with Google </ion-text>
                        </ion-button>
                    </ion-row>
                    <ion-row class="ion-justify-content-center ion-padding">
                        <ion-text class="privacy-text">
                            By creating your account you agree with our
                            <a href="https://app.firecrackervocabulary.com/privacy-policy" target="_blank">
                                Privacy Policy
                            </a>
                        </ion-text>
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

export default defineComponent({
    name: 'SignIn',
    components: {
        FirecrackerHeader,
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
    },
    data() {
        return { faGoogle };
    },
    methods: {
        async handleClick(): Promise<void> {
            await Alert.presentAlertConfirm(
                '',
                `"Firecracker Vocab Practice" collects your name, email address, and photo. And for your kind information, we don't sell or share those with any third party user.`,
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
                if (error.error !== 'popup_closed_by_user') {
                    await Toast.present(MessageDB.networkError);
                }
            }
        },
        async persistUser(googleUser: User): Promise<void> {
            const persistedUser = await HttpHandler.post<User, User>(`/v1/users`, _.omit(googleUser, 'jwToken'), true);
            await NativeStorage.setAuthorizedUser({ ...persistedUser, jwToken: googleUser.jwToken } as User);
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
.logo-extra {
    width: 45%;
}
@media only screen and (min-device-width: 480px) {
    .logo-extra {
        width: 13%;
    }
}
.privacy-text {
    text-align: center;
}
</style>
