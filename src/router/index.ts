import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Home from '@/views/kick-off/Home.vue';
import AddVocabulary from '@/views/vocab-upsert/AddVocabulary.vue';
import SignIn from '@/views/kick-off/SignIn.vue';
import Cohort from '@/views/cohort/Cohort.vue';
import VocabularyList from '@/views/vocab-read/VocabularyList.vue';
import Route, { PublicRoute } from '@/domains/Route';
import * as _ from 'lodash';
import NativeStorage from '@/utils/NativeStorage';
import DictionaryPage from '@/views/vocab-read/DictionaryPage.vue';
import LeitnerSystems from '@/views/leitner-systems/LeitnerSystems.vue';
import LeitnerBoxItems from '@/views/leitner-systems/LeitnerBoxItems.vue';
import PrivacyPolicy from '@/views/privacy-policy/PrivacyPolicy.vue';
import LinkerWord from '@/views/vocab-read/LinkerWord.vue';
import VocabularyDetailsPage from '@/views/vocab-read/VocabularyDetailsPage.vue';
import Deletion from '@/views/kick-the-bucket/Deletion.vue';

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
        path: '/vocabulary/read/:id/:word/:disableInsertingIntoLeitnerBox',
        name: Route.DisplayVocabulary,
        component: VocabularyDetailsPage,
    },
    {
        path: '/linker-words/:word',
        name: Route.LinkerWord,
        component: LinkerWord,
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
        path: '/leitner-box/items/:box/:count',
        name: Route.LeitnerBoxItems,
        component: LeitnerBoxItems,
    },
    {
        path: '/privacy-policy',
        name: Route.PrivacyPolicy,
        component: PrivacyPolicy,
    },
    {
        path: '/goodbye',
        name: Route.Deletion,
        component: Deletion,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, from, next): Promise<void> => {
    const isValidRoute = _.includes(_.map(routes, 'name'), to.name);
    const isPublicRoute = _.includes(Object.values(PublicRoute), to.name);
    const isAuthenticated = await NativeStorage.isAuthenticated();
    if (isPublicRoute) {
        next();
    } else if (!isValidRoute || (!isAuthenticated && to.name !== Route.SignIn)) {
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
