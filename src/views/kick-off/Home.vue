<template>
    <spinner />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import Spinner from '@/views/shared/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';
import { useBackButton, useIonRouter } from '@ionic/vue';
import { App } from '@capacitor/app';
import Toast from '@/utils/Toast';
import MessageDB from '@/utils/MessageDB';
import BackButtonHandlerPriority from '@/domains/BackButtonHandlerPriority';
import { isHome } from '@/domains/Route';
import HttpHandler from '@/utils/HttpHandler';
import Android from '@/domains/Android';
import Alert from '@/utils/Alert';
import Platform from '@/utils/Platform';
import User from '@/domains/User';

export default defineComponent({
    name: 'Home',
    components: {
        Spinner,
    },
    setup() {
        const ionRouter = useIonRouter();
        const route = useRoute();

        useBackButton(BackButtonHandlerPriority.HOME, () => {
            if (!ionRouter.canGoBack() || isHome(route.name as string)) {
                App.exitApp();
            }
        });
    },
    async mounted() {
        // we need to remove this block after a while
        await NativeStorage.removeAuthorizedUser().catch(() => {
            // empty block
        });

        await this.init();
        this.assertNotifyingAboutAvailableUpdate().finally();
    },
    methods: {
        async init(): Promise<void> {
            try {
                const localUser = await HttpHandler.get<User>('/v1/users/self');
                if (localUser) {
                    await NativeStorage.setIsAuthenticated(true);
                    await this.$router.replace('/authenticated-home');
                } else {
                    await NativeStorage.setIsAuthenticated(false);
                    await this.$router.replace('/sign-in');
                }
            } catch (error) {
                const { status } = error as Error & { status?: number };

                if (status === 401) {
                    await NativeStorage.setIsAuthenticated(false);
                    await this.$router.replace('/sign-in');
                    return;
                }

                await Toast.present(MessageDB.genericError, 'error');
                await this.$router.replace('/sign-in');
            }
        },
        async assertNotifyingAboutAvailableUpdate(): Promise<void> {
            try {
                const { versionCode, isAndroid } = await Platform.getVersion();
                if (isAndroid) {
                    const { versionCode: latestVersionCode } = await HttpHandler.get<Android>('/v1/androids');
                    if (Number.parseInt(versionCode, 10) < latestVersionCode) {
                        this.notifyAboutAvailableUpdate();
                    }
                }
            } catch {
                // do nothing
            }
        },
        notifyAboutAvailableUpdate(): void {
            Alert.presentConfirm({
                message: 'There is a newer version available for download. Would you like to update it now?',
                confirmLabel: 'Update',
                cancelLabel: 'No thanks!',
                onConfirm: async () => {
                    window.open(
                        'https://play.google.com/store/apps/details?id=com.emtiajium.firecracker.collaborative.vocab.practice',
                        '_blank',
                    );
                },
            }).finally();
        },
    },
});
</script>
