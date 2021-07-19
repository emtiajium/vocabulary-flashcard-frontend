import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import AddVocabulary from '@/views/AddVocabulary.vue';
import Vocabulary from '@/views/VocabularyDetails.vue';
import SignIn from '@/views/SignIn.vue';
import Cohort from '@/views/Cohort.vue';
import VocabularyList from '@/views/VocabularyList.vue';
import Route from '@/domains/Route';
import * as _ from 'lodash';
import NativeStorage from '@/utils/NativeStorage';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: Route.Root,
        redirect: '/home',
    },
    {
        path: '/home',
        name: Route.Home,
        component: Home,
    },
    {
        path: '/sign-in',
        name: Route.SignIn,
        component: SignIn,
    },
    {
        path: '/authenticated-home',
        name: Route.AuthenticatedHome,
        redirect: '/vocabularies',
    },
    {
        path: '/vocabularies',
        name: Route.Vocabularies,
        component: VocabularyList,
    },
    {
        path: '/vocabulary/create',
        name: Route.AddVocabulary,
        component: AddVocabulary,
    },
    {
        path: '/vocabulary/update/:id',
        name: Route.EditVocabulary,
        component: AddVocabulary,
    },
    {
        path: '/vocabulary/read/:id/:word',
        name: Route.DisplayVocabulary,
        component: Vocabulary,
    },
    {
        path: '/cohort/read',
        name: Route.DisplayCohort,
        component: Cohort,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, from, next): Promise<void> => {
    const isValidRoute = _.includes(_.map(routes, 'name'), to.name);
    const isAuthenticated = await NativeStorage.isAuthenticated();
    if (!isValidRoute || (!isAuthenticated && to.name !== Route.SignIn)) {
        next(`/sign-in`);
    } else if (!isAuthenticated && to.name === Route.SignIn) {
        next();
    } else if (!_.includes([Route.AddVocabulary, Route.EditVocabulary], from.name)) {
        await NativeStorage.setShouldReloadVocabularies(false);
        next();
    } else {
        next();
    }
});

export default router;
