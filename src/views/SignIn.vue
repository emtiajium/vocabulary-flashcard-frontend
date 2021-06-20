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
        await this.load();
        if (this.googleAuth.isSignedIn()) {
            this.onSuccessfulAuthentication(this.googleAuth.getAuthenticatedUser());
        } else {
            this.googleAuth.renderElement(this.signInButtonId);
        }
    },
    methods: {
        async load() {
            await Promise.all([this.googleAuth.onGoogleApiLoad(), this.googleAuth.createScript()]);
        },
        async handleClick() {
            const user = await this.googleAuth.signIn();
            this.onSuccessfulAuthentication(user);
        },
        onSuccessfulAuthentication(user: User) {
            console.log(`User details`, user);
        },
    },
});
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
