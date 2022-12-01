<template>
    <view>
        <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
            <span class="ion-text-center"> Looks like something is wrong with your network. Please try later. </span>
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
});
</script>

<style scoped>
.network-error-icon {
    font-size: 50pt;
    color: var(--ion-color-primary);
}
</style>
