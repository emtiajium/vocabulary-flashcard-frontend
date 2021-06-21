import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AuthenticatedHome from '@/views/AuthenticatedHome.vue';
import Home from '@/views/Home.vue';
import AddVocabulary from '@/views/AddVocabulary.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
    },
    {
        path: '/authenticated-home',
        name: 'AuthenticatedHome',
        component: AuthenticatedHome,
    },
    {
        path: '/add-vocabulary',
        name: 'AddVocabulary',
        component: AddVocabulary,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
