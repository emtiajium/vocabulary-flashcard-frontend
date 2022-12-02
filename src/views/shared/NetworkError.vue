<template>
    <view>
        <ion-card-subtitle class="ion-padding ion-text-center">
            {{ message || 'Looks like something is wrong with your network. Please try later.' }}
        </ion-card-subtitle>
        <view class="display-flex ion-justify-content-center ion-padding-bottom">
            <span class="material-icons network-error-icon"> wifi_off </span>
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle } from '@ionic/vue';

export default defineComponent({
    name: 'NetworkError',
    components: {
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

<style scoped>
.network-error-icon {
    font-size: 50pt;
    color: var(--ion-color-primary);
}
</style>
