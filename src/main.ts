import 'reflect-metadata';
import '@/styles/main.css';
import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import App from '@/App.vue';
import router from '@/router';
import { initTheme } from '@/utils/dark-mode';

const app = createApp(App)
    .use(IonicVue, {
        mode: 'md',
    })
    .use(router);

router.isReady().then(() => {
    app.mount('#app');
    initTheme().finally();
});
