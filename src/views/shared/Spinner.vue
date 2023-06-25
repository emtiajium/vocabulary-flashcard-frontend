<template>
    <view class="container ion-justify-content-center ion-padding-top ion-padding-bottom" :style="inlineStyle">
        <ion-spinner aria-label="Loading" color="primary" name="lines" class="firecracker-spinner" />
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
    props: {
        inlineStyle: {
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
.container {
    height: 100%;
    display: flex;
}

.firecracker-spinner {
    height: var(--default-spinner-dimension);
    width: var(--default-spinner-dimension);
}
</style>
