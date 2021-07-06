<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>
                    <ion-text class="ion-text-center">
                        <h3>Firecracker Vocab Practice</h3>
                    </ion-text>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <view class="container">
                <ion-grid class="display-grid ion-align-items-center">
                    <ion-row class="ion-justify-content-center">
                        <img src="/assets/icon/icon.png" alt="Logo" class="logo-extra" />
                    </ion-row>
                    <ion-row class="ion-justify-content-center">
                        <ion-button @click="handleClick">
                            <font-awesome-icon :icon="faGoogle" />
                            <ion-text class="ion-padding-start">Continue with Google</ion-text>
                        </ion-button>
                    </ion-row>
                </ion-grid>
            </view>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonButton, IonGrid, IonRow } from '@ionic/vue';
import { defineComponent } from 'vue';
import GoogleAuth from '@/utils/GoogleAuthorization';
import User from '@/domains/User';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import NativeStorage from '@/utils/NativeStorage';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default defineComponent({
    name: 'SignIn',
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonText,
        IonButton,
        FontAwesomeIcon,
        IonGrid,
        IonRow,
    },
    async mounted() {
        await GoogleAuth.load();
    },
    data() {
        return { faGoogle };
    },
    methods: {
        async handleClick(): Promise<void> {
            try {
                const user = await GoogleAuth.signIn();
                await this.persistUser(user);
                await this.$router.push('/authenticated-home');
            } catch (error) {
                await Toast.present(error.message || `Something went wrong!`);
            }
        },
        async persistUser(user: User): Promise<void> {
            const persistedUser = await HttpHandler.post<User, User>(`/v1/users`, user, true);
            await NativeStorage.setAuthorizedUser(persistedUser as User);
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
</style>
