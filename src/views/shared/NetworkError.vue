<template>
    <ion-card-subtitle class="ion-padding ion-text-center">
        {{ message || defaultMessage }}
    </ion-card-subtitle>
    <view class="display-flex ion-justify-content-center ion-padding-bottom">
        <lottie-animation class="network-error-animation" :animation-data="noConnectionAnimation">
            <template #fallback>
                <wifi-off-icon
                    :fill-color-variable="'--ion-color-primary'"
                    :stroke-color-variable="'--ion-color-primary'"
                />
            </template>
        </lottie-animation>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle } from '@ionic/vue';
import WifiOffIcon from '@/media/WifiOffIcon.vue';
import LottieAnimation from '@/media/LottieAnimation.vue';
import noConnection from '@/media/lottie/no-connection.json';
import MessageDB from '@/utils/MessageDB';

export default defineComponent({
    name: 'NetworkError',
    components: {
        WifiOffIcon,
        LottieAnimation,
        IonCardSubtitle,
    },
    props: {
        message: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            defaultMessage: MessageDB.networkError,
            noConnectionAnimation: noConnection as Record<string, unknown>,
        };
    },
});
</script>

<style scoped>
.network-error-animation {
    width: min(120px, 40%);
}
</style>
