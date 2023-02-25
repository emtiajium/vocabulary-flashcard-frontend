<template>
    <ion-card-subtitle class="ion-padding ion-text-center">
        {{ message || defaultMessage }}
    </ion-card-subtitle>
    <view class="display-flex ion-justify-content-center ion-padding-bottom">
        <wifi-off-icon :fill-color-variable="'--ion-color-primary'" :stroke-color-variable="'--ion-color-primary'" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle } from '@ionic/vue';
import WifiOffIcon from '@/media/WifiOffIcon.vue';
import MessageDB from '@/utils/MessageDB';

export default defineComponent({
    name: 'NetworkError',
    components: {
        WifiOffIcon,
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
        };
    },
});
</script>

<style scoped></style>
