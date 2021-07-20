<template>
    <spinner />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Spinner from '@/views/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';
import { useBackButton, useIonRouter } from '@ionic/vue';
import { App } from '@capacitor/app';
import Toast from '@/utils/Toast';
import MessageDB from '@/utils/MessageDB';
import BackButtonHandlerPriority from '@/domains/BackButtonHandlerPriority';
import { isHome } from '@/domains/Route';

export default defineComponent({
    name: 'Home',
    components: {
        Spinner,
    },
    async mounted() {
        this.subscribeToHardwareBackButtonListener();
        await this.init();
    },
    methods: {
        subscribeToHardwareBackButtonListener(): void {
            const ionRouter = useIonRouter();
            useBackButton(BackButtonHandlerPriority.HOME, () => {
                if (!ionRouter.canGoBack() || isHome(this.$route.name as string)) {
                    App.exitApp();
                }
            });
        },
        async init(): Promise<void> {
            try {
                const localUser = await NativeStorage.getAuthorizedUser();
                if (localUser) {
                    await this.$router.replace('/authenticated-home');
                } else {
                    await this.$router.replace('/sign-in');
                }
            } catch (error) {
                await Promise.all([Toast.present(MessageDB.genericError), this.$router.push('/sign-in')]);
            }
        },
    },
});
</script>
