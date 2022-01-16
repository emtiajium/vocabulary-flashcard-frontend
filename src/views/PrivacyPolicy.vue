<template>
    <ion-page>
        <firecracker-header
            type="MENU"
            header-title="Privacy Policy"
            content-id="privacy-policy"
            menu-id="privacy-policy-menu"
        />
        <ion-content :fullscreen="true" id="privacy-policy"> </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import { IonContent, IonPage } from '@ionic/vue';

export default defineComponent({
    name: 'PrivacyPolicy',
    components: { FirecrackerHeader, IonContent, IonPage },
});
</script>

<style scoped></style>
