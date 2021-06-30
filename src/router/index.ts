import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AuthenticatedHome from '@/views/AuthenticatedHome.vue';
import Home from '@/views/Home.vue';
import AddVocabulary from '@/views/AddVocabulary.vue';
import Vocabulary from '@/views/Vocabulary.vue';
import SignIn from '@/views/SignIn.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Root',
        redirect: '/home',
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
    },
    {
        path: '/sign-in',
        name: 'SignIn',
        component: SignIn,
    },
    {
        path: '/authenticated-home',
        name: 'AuthenticatedHome',
        component: AuthenticatedHome,
    },
    {
        path: '/vocabularies',
        name: 'Vocabularies',
        redirect: '/authenticated-home',
    },
    {
        path: '/add-vocabulary',
        name: 'AddVocabulary',
        component: AddVocabulary,
    },
    {
        path: '/edit-vocabulary/:id',
        name: 'EditVocabulary',
        component: AddVocabulary,
    },
    {
        path: '/vocabulary/:id',
        name: 'DisplayVocabulary',
        component: Vocabulary,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
