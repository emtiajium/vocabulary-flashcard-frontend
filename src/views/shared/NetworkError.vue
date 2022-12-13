<template>
    <ion-card-subtitle class="ion-padding ion-text-center">
        {{ message || 'Looks like something is wrong with your network. Please try later.' }}
    </ion-card-subtitle>
    <view class="display-flex ion-justify-content-center ion-padding-bottom">
        <wifi-off-icon :color-variable="'--ion-color-primary'" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle } from '@ionic/vue';
import WifiOffIcon from '@/media/WifiOffIcon.vue';

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
            default(): string {
                return '';
            },
        },
    },
});
</script>

<style scoped></style>
