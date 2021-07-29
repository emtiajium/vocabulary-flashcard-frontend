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
import DictionaryPage from '@/views/DictionaryPage.vue';
import LeitnerSystems from '@/views/LeitnerSystems.vue';
import LeitnerBoxItems from '@/views/LeitnerBoxItems.vue';

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
        path: '/dictionary/:word',
        name: Route.Dictionary,
        component: DictionaryPage,
    },
    {
        path: '/cohort/read',
        name: Route.DisplayCohort,
        component: Cohort,
    },
    {
        path: '/leitner-systems',
        name: Route.LeitnerSystems,
        component: LeitnerSystems,
    },
    {
        path: '/leitner-box/items/:box',
        name: Route.LeitnerBoxItems,
        component: LeitnerBoxItems,
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
        // do not need to wait for the response
        NativeStorage.setShouldReloadVocabularies(false).finally();
        next();
    } else {
        next();
    }
});

export default router;
