<template>
    <ion-page>
        <firecracker-header
            type="MENU"
            header-title="Privacy Policy"
            content-id="privacy-policy"
            menu-id="privacy-policy-menu"
        />
        <ion-content :fullscreen="true" id="privacy-policy">
            <ion-row class="display-flex ion-justify-content-center margin-bottom-5">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
                    <ion-card class="margin-top-bottom-unset">
                        <ion-card-content>
                            <ion-card-subtitle class="link-container">
                                Welcome to <strong>Firecracker Vocabulary Flashcards</strong>! Your privacy is important
                                to us. This Privacy Policy explains how we collect, store, use, disclose and otherwise
                                process your information when you use
                                <a href="https://firecrackervocabulary.com" :target="isAndroid ? '_blank' : '_self'"
                                    >https://firecrackervocabulary.com</a
                                >, and our
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.emtiajium.firecracker.collaborative.vocab.practice"
                                    target="_blank"
                                    >mobile app</a
                                >.
                            </ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top header">
                                Information Collection
                            </ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top link-container">
                                There is certain information that we collect automatically when you sign-up through
                                Google, and authorize us to collect your authentication information, such as your
                                <strong>firstname</strong>, <strong>lastname</strong>, <strong>email address</strong>,
                                and <strong>profile picture (avatar)</strong>. Google will ask your permission to share
                                above mentioned information under the terms of
                                <a href="https://policies.google.com/privacy" target="_blank"
                                    >Google's Privacy Policy</a
                                >
                                from your Google account. You can regulate the information that we receive from Google
                                using your
                                <a href="https://myaccount.google.com/privacy#toolsyoucanusenow" target="_blank"
                                    >Google activity controls</a
                                >. Other than those pieces of information, we don't store any kind of data of you
                                without your consent.
                            </ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top header"> Information Usage</ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top">
                                We store the collected data into our database to operate and maintain your account,
                                identify you, for example, as the vocabulary creator, to create and maintain a cohort.
                            </ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top header"> Information Sharing</ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top">
                                We share your name, avatar, email address and vocabulary you created with the other
                                members if you join a cohort with them. However, we do not share your data with any
                                third-party user, either provided by Google (during the sign-up) or the vocabulary you
                                created.
                            </ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top header"> Information Disclose</ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top">
                                We collect and transmit data using industry-standard SSL (Secure Socket Layer)
                                encryption. We authenticate, authorize every request in a secure manner for your
                                safeness.
                            </ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top header"> Information Deletion</ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top">
                                Contact us if you want to delete your Google provided info, your created vocabulary, or
                                any kind of data that we have.
                            </ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top header"> Contact Information</ion-card-subtitle>

                            <ion-card-subtitle class="ion-padding-top email-container">
                                If you do not agree to any of the provisions of this privacy policy, you should not use
                                the Platform. Do not hesitate to mail us at
                                <a href="mailto:271emtiaj@gmail.com">271emtiaj@gmail.com</a> for any kind of query.
                            </ion-card-subtitle>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import { IonContent, IonPage, IonCard, IonCardContent, IonCardSubtitle, IonRow, IonCol } from '@ionic/vue';
import Platform from '@/utils/Platform';

export default defineComponent({
    name: 'PrivacyPolicy',
    components: {
        FirecrackerHeader,
        IonContent,
        IonPage,
        IonCard,
        IonCardContent,
        IonCardSubtitle,
        IonRow,
        IonCol,
    },
    data() {
        return { isAndroid: true };
    },
    async mounted() {
        this.isAndroid = await Platform.isAndroid();
    },
});
</script>

<style scoped>
.header {
    font-weight: bold;
}
</style>
