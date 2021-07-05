<template>
    <spinner />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Spinner from '@/views/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';
import { useBackButton, useIonRouter } from '@ionic/vue';
import { App } from '@capacitor/app';

export default defineComponent({
    name: 'Home',
    components: {
        Spinner,
    },
    setup() {
        const ionRouter = useIonRouter();
        useBackButton(-1, () => {
            if (!ionRouter.canGoBack()) {
                App.exitApp();
            }
        });
    },
    async mounted() {
        const user = await NativeStorage.getAuthorizedUser();
        if (user) {
            await this.$router.push('/authenticated-home');
        } else {
            await this.$router.push('/sign-in');
        }
    },
});
</script>
