<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title
                    ><ion-text class="ion-text-center">
                        <h3>IELTS Gibberish</h3>
                    </ion-text></ion-title
                >
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <view class="container ion-justify-content-center ion-align-items-center">
                <ion-button @click="handleClick">
                    <ion-icon :icon="logoGoogle"></ion-icon>
                    <ion-text class="ion-padding-start ion-text-capitalize">Sign in with Google</ion-text>
                </ion-button>
            </view>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonButton, IonIcon } from '@ionic/vue';
import { defineComponent } from 'vue';
import GoogleAuth from '@/utils/GoogleAuthorization';
import User from '@/domains/User';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import NativeStorage from '@/utils/NativeStorage';
import { logoGoogle } from 'ionicons/icons';

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
        IonIcon,
    },
    async mounted() {
        await GoogleAuth.load();
    },
    data() {
        return { logoGoogle };
    },
    methods: {
        async handleClick() {
            const user = await GoogleAuth.signIn();
            await Promise.all([this.persistUser(user), this.$router.push('/authenticated-home')]);
        },
        async persistUser(user: User) {
            try {
                const persistedUser = await HttpHandler.post<User, User>(`/v1/users`, user);
                await NativeStorage.setAuthorizedUser(persistedUser as User);
            } catch (error) {
                await Toast.present(error.message);
            }
        },
    },
});
</script>

<style scoped>
.container {
    height: 100%;
    display: flex;
}
</style>
