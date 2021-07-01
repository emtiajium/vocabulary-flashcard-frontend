<template>
    <view>
        <view class="empty-container ion-justify-content-center">
            <ion-label class="empty-container-message">{{ message }}</ion-label>
        </view>
        <br />
        <view class="empty-container ion-justify-content-center">
            <font-awesome-icon :icon="faMehBlank" class="fa-meh-blank-extra" />
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
.empty-container {
    display: flex;
}
.empty-container-message {
    font-size: 12pt;
}
.fa-meh-blank-extra {
    font-size: 100pt;
    color: #2e8b57;
}
</style>
