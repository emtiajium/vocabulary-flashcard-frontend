<template>
    <view class="end-of-list">
        <ion-card-subtitle class="ion-padding ion-text-center">{{ message || defaultMessage }}</ion-card-subtitle>
        <view class="display-flex ion-justify-content-center ion-padding-bottom" :style="inlineStyle">
            <lottie-animation class="end-of-list-animation" :animation-data="reachedTheEndAnimation" :loop="true">
                <template #fallback>
                    <font-awesome-icon :icon="faListCheck" class="firecracker-primary-color-icon-large" />
                </template>
            </lottie-animation>
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle } from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import LottieAnimation from '@/media/LottieAnimation.vue';
import reachedTheEnd from '@/media/lottie/reached-the-end.json';
import MessageDB from '@/utils/MessageDB';

/**
 * Marks the bottom of a list the user has browsed to the end of.
 *
 * Drop it in after the last item of any list, once the list is known to be
 * complete (no more pages to fetch). It says nothing about how many items there
 * were, so it reads the same for a short list and a long one.
 */
export default defineComponent({
    name: 'EndOfList',
    components: {
        FontAwesomeIcon,
        IonCardSubtitle,
        LottieAnimation,
    },
    props: {
        message: {
            type: String,
            required: false,
        },
        inlineStyle: {
            type: String,
            required: false,
            default(): string {
                return '';
            },
        },
    },
    data() {
        return {
            defaultMessage: MessageDB.endOfList,
            faListCheck,
            reachedTheEndAnimation: reachedTheEnd,
        };
    },
});
</script>

<style scoped>
.end-of-list-animation {
    width: min(160px, 50%);
}
</style>
