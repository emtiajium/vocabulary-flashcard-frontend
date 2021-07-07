<template>
    <spinner />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Spinner from '@/views/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';
import { useBackButton, useIonRouter } from '@ionic/vue';
import { App } from '@capacitor/app';
import HttpHandler from '@/utils/HttpHandler';
import User from '@/domains/User';

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
        const localUser = await NativeStorage.getAuthorizedUser();
        if (localUser) {
            // get the user info from the server
            // as cohort can be updated anytime by the super admin
            const user = await HttpHandler.get<User>(`/v1/users/self`);
            await NativeStorage.setAuthorizedUser({ ...user, jwToken: localUser.jwToken });
            await this.$router.push('/authenticated-home');
        } else {
            await this.$router.push('/sign-in');
        }
    },
});
</script>
