<template>
    <view>
        <view class="display-flex ion-justify-content-center">
            <ion-label class="empty-container-message ion-text-center"> {{ message }} </ion-label>
        </view>
        <br />
        <view class="display-flex ion-justify-content-center">
            <font-awesome-icon :icon="faMehBlank" class="firecracker-primary-color-icon-large" />
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMehBlank } from '@fortawesome/free-regular-svg-icons';
import { IonLabel } from '@ionic/vue';

export default defineComponent({
    name: 'EmptyContainer',
    components: {
        IonLabel,
        FontAwesomeIcon,
    },
    props: ['message'],
    data() {
        return {
            faMehBlank,
        };
    },
});
</script>

<style scoped>
.empty-container-message {
    font-size: 1.25rem;
}
</style>
