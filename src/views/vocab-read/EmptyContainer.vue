<template>
    <view>
        <view class="display-flex ion-justify-content-center">
            <ion-label class="empty-container-message ion-text-center"> {{ message }} </ion-label>
        </view>
        <br />
        <view class="display-flex ion-justify-content-center">
            <lottie-animation class="empty-container-animation" :animation-data="emptyDefinitionAnimation" :loop="true">
                <template #fallback>
                    <font-awesome-icon :icon="faMehBlank" class="firecracker-primary-color-icon-large" />
                </template>
            </lottie-animation>
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMehBlank } from '@fortawesome/free-regular-svg-icons';
import { IonLabel } from '@ionic/vue';
import LottieAnimation from '@/media/LottieAnimation.vue';
import emptyDefinition from '@/media/lottie/empty-definition.json';

export default defineComponent({
    name: 'EmptyContainer',
    components: {
        IonLabel,
        FontAwesomeIcon,
        LottieAnimation,
    },
    props: ['message'],
    data() {
        return {
            faMehBlank,
            emptyDefinitionAnimation: emptyDefinition,
        };
    },
});
</script>

<style scoped>
.empty-container-message {
    font-size: var(--text-md);
    line-height: var(--leading-normal);
    color: var(--ion-text-color-step-300);
}

.empty-container-animation {
    width: min(120px, 40%);
}
</style>
