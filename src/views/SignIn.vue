<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>IELTS Gibberish</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="container">
                <div @click="handleClick" :id="signInButtonId"></div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent } from 'vue';
import GoogleAuth from '@/utils/GoogleAuthorization';
import User from '@/domains/User';
import HttpHandler from '@/utils/HttpHandler';
import Toast from '@/utils/Toast';
import NativeStorage from '@/utils/NativeStorage';

export default defineComponent({
    name: 'SignIn',
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
    },
    data() {
        return {
            signInButtonId: `btn-google-sign-in`,
            googleAuth: new GoogleAuth(),
        };
    },
    async mounted() {
        await this.googleAuth.load();
        if (this.googleAuth.isSignedIn()) {
            await this.persistUser(this.googleAuth.getAuthenticatedUser());
        } else {
            this.googleAuth.renderElement(this.signInButtonId);
        }
    },
    methods: {
        async handleClick() {
            const user = await this.googleAuth.signIn();
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
    justify-content: center;
    align-items: center;
}
</style>
