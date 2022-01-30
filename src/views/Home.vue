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
import HttpHandler from '@/utils/HttpHandler';
import Android from '@/domains/Android';
import Alert from '@/utils/Alert';
import Platform from '@/utils/Platform';

export default defineComponent({
    name: 'Home',
    components: {
        Spinner,
    },
    async mounted() {
        this.subscribeToHardwareBackButtonListener();
        await this.init();
        this.notifyAboutAvailableUpdate().finally();
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
        async notifyAboutAvailableUpdate(): Promise<void> {
            try {
                const isAndroid = await Platform.isAndroid();
                if (isAndroid) {
                    const { build: versionCode } = await App.getInfo();
                    const { versionCode: latestVersionCode } = await HttpHandler.get<Android>(`/v1/androids`);
                    if (Number.parseInt(versionCode, 10) < latestVersionCode) {
                        Alert.presentButtonLessAlert(
                            '',
                            'There is a newer version available for download! Please update the app by visiting the Google Play Store.',
                        ).finally();
                    }
                }
            } catch {
                // do nothing
            }
        },
    },
});
</script>
