<template>
    <view class="container ion-justify-content-center ion-padding-top ion-padding-bottom">
        <ion-spinner aria-label="Loading" color="primary" name="lines" />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonSpinner } from '@ionic/vue';

export default defineComponent({
    name: 'Spinner',
    components: {
        IonSpinner,
    },
});
</script>

<style scoped>
.container {
    height: 100%;
    display: flex;
}
</style>
