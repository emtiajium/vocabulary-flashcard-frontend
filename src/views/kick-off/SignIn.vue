<template>
    <ion-page>
        <ion-content :fullscreen="true" id="sign-in">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col
                    sizeXs="12"
                    sizeSm="12"
                    sizeMd="12"
                    sizeLg="12"
                    sizeXl="12"
                    style="padding-top: unset; padding-bottom: unset"
                >
                    <div class="swiper">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">
                                <intro :current-index="0" />
                            </div>
                            <div class="swiper-slide">
                                <intro :current-index="1" />
                            </div>
                            <div class="swiper-slide">
                                <intro :current-index="2" />
                            </div>
                            <div class="swiper-slide">
                                <intro :current-index="3" />
                            </div>
                            <div class="swiper-slide">
                                <div class="display-flex ion-justify-content-center">
                                    <div>
                                        <!-- disabling the rule as this <div /> is supposed to have appeared only on the Android native app -->
                                        <!-- not sure how to navigate on Android native app using the keyboard -->
                                        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
                                        <div
                                            v-if="isAndroid"
                                            class="display-flex ion-justify-content-center"
                                            @click="handleClick"
                                        >
                                            <continue-with-google />
                                        </div>

                                        <div
                                            v-show="!isAndroid"
                                            id="google-sign-in"
                                            class="display-flex ion-justify-content-center"
                                        ></div>

                                        <div class="display-flex ion-justify-content-center ion-padding-top">
                                            <ion-card-subtitle class="ion-text-center link-container">
                                                By creating your account, you agree with our
                                                <router-link to="/privacy-policy"> Privacy Policy </router-link>
                                            </ion-card-subtitle>
                                        </div>

                                        <div
                                            v-if="!isAndroid"
                                            class="display-flex ion-justify-content-center google-play-container"
                                        >
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, IonCardSubtitle, IonRow, useBackButton, IonCol } from '@ionic/vue';
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
import Alert from '@/utils/Alert';
import Intro from '@/views/kick-off/Intro.vue';
import Platform from '@/utils/Platform';
import ContinueWithGoogle from '@/views/kick-off/ContinueWithGoogle.vue';
import { FirecrackerError } from '@/domains/FirecrackerError';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

export default defineComponent({
    name: 'SignIn',
    components: {
        IonCol,
        ContinueWithGoogle,
        Intro,
        IonContent,
        IonPage,
        IonRow,
        IonCardSubtitle,
    },
    setup() {
        useBackButton(BackButtonHandlerPriority.SIGN_IN, async () => {
            await App.exitApp();
        });
    },
    async ionViewDidEnter() {
        this.initSwiper();
        await GoogleAuthentication.load('google-sign-in', this.handleClick);
        this.loadGetItOnGooglePlay().finally();
    },
    data() {
        return {
            swiper: undefined as Swiper,
            isAndroid: true,
            faGoogle,
        };
    },
    methods: {
        initSwiper(): void {
            if (this.swiper) {
                return;
            }
            this.swiper = new Swiper('.swiper', {
                modules: [Pagination],
                init: true,
                rewind: true,
                spaceBetween: 10,
                initialSlide: 0,
                pagination: {
                    el: '.swiper-pagination',
                    dynamicBullets: true,
                },
            });
        },

        // eslint-disable-next-line consistent-return
        async handleClick(): Promise<void> {
            if (await this.isGoodbye()) {
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
                if (await this.isGoodbye()) {
                    await this.$router.replace('/goodbye');
                } else {
                    const { user } = GoogleAuthentication;
                    await this.persistUser(user);
                    await this.$router.replace('/authenticated-home');
                }
            } catch (error) {
                if (
                    (error as FirecrackerError).error &&
                    ['popup_closed_by_user', 'access_denied'].includes((error as FirecrackerError).error as string)
                ) {
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

        async isGoodbye(): Promise<boolean> {
            return (await NativeStorage.getGoodBye()) === 'okay!';
        },
    },
});
</script>

<style scoped>
.google-play-container {
    padding-top: calc(var(--ion-padding) * 6);
}

.google-play {
    width: 100%;
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
    .google-play {
        width: 50%;
    }
}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {
    .google-play {
        width: 40%;
    }
}

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {
    .google-play {
        width: 40%;
    }
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {
    .google-play {
        width: 35%;
    }
}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {
    .google-play {
        width: 30%;
    }
}

.swiper {
    width: 100%;
    height: 100vh;
}

.swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ion-padding);
    background: var(--ion-card-background);
}
</style>
