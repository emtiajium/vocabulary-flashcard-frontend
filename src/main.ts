import 'reflect-metadata';
import '@/styles/main.css';
import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import App from '@/App.vue';
import router from '@/router';
import { initTheme } from '@/utils/dark-mode';
import { isStoreScreenshotMode, startStoreScreenshotSession } from '@/store-screenshot';

async function bootstrap(): Promise<void> {
    if (isStoreScreenshotMode()) {
        // Development-only: land on authenticated screens for the Play Store
        // screenshot pipeline without going through Google Sign-In.
        await startStoreScreenshotSession();
    }

    const app = createApp(App)
        .use(IonicVue, {
            mode: 'md',
        })
        .use(router);

    await router.isReady();
    app.mount('#app');
    initTheme().finally();
}

bootstrap();
