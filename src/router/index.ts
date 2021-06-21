import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AuthenticatedHome from '@/views/AuthenticatedHome.vue';
import Home from '@/views/Home.vue';
import AddVocabulary from '@/views/AddVocabulary.vue';
import AddDefinition from '@/views/AddDefinition.vue';

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
    {
        // `No match found for location with path "/add-definition/53e8b03b-0786-4a9e-8e0d-aeb06cc734b9/hello`
        // using camel case for the route param to avoid the above error
        path: '/add-definition/:vocabularyId/:word',
        name: 'AddDefinition',
        component: AddDefinition,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
