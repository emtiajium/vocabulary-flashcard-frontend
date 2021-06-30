<template>
    <view v-bind="$attrs" v-if="isLoading">
        <spinner />
    </view>
    <view v-bind="$attrs" v-if="!isLoading && !isAuthorized">
        <sign-in />
    </view>
    <view v-bind="$attrs" v-if="!isLoading && isAuthorized">
        <authenticated-home />
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SignIn from '@/views/SignIn.vue';
import Spinner from '@/views/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';
import AuthenticatedHome from '@/views/AuthenticatedHome.vue';

export default defineComponent({
    name: 'Home',
    components: {
        AuthenticatedHome,
        Spinner,
        SignIn,
    },
    data() {
        return {
            isLoading: true,
            isAuthorized: false,
        };
    },
    async mounted() {
        const user = await NativeStorage.getAuthorizedUser();
        if (user) {
            this.isAuthorized = true;
        }
        this.isLoading = false;
    },
});
</script>
