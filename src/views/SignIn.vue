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
            await this.persistUser(user);
        },
        async persistUser(user: User) {
            try {
                await HttpHandler.post<User, User>(`/v1/users`, user);
                await this.$router.push('/authenticated-home');
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
