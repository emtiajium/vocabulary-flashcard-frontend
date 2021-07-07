<template>
    <view>
        <ion-card-subtitle class="display-flex ion-justify-content-center ion-padding">
            <span class="ion-text-center"> Looks like something is wrong with your network. Please try later. </span>
        </ion-card-subtitle>
        <view class="display-flex ion-justify-content-center ion-padding-bottom">
            <font-awesome-icon :icon="faExclamationTriangle" class="network-error-icon" />
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle } from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'NetworkError',
    components: {
        IonCardSubtitle,
        FontAwesomeIcon,
    },
    data() {
        return {
            faExclamationTriangle,
        };
    },
});
</script>

<style scoped>
.network-error-icon {
    font-size: 60pt;
    color: #50c878;
}
</style>
