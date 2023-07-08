import * as _ from 'lodash';

enum Route {
    Root = 'Root',
    SignIn = 'SignIn',
    Home = 'Home',
    AuthenticatedHome = 'AuthenticatedHome',
    Vocabularies = 'Vocabularies',
    AddVocabulary = 'AddVocabulary',
    EditVocabulary = 'EditVocabulary',
    DisplayVocabulary = 'DisplayVocabulary',
    DisplayCohort = 'DisplayCohort',
    Dictionary = 'Dictionary',
    LeitnerSystems = 'LeitnerSystems',
    LeitnerBoxItems = 'LeitnerBoxItems',
    PrivacyPolicy = 'PrivacyPolicy',
    LinkerWord = 'LinkerWord',
    Deletion = 'Deletion',
}

export enum PublicRoute {
    PrivacyPolicy = 'PrivacyPolicy',
    Deletion = 'Deletion',
}

export default Route;

export function isHome(route: string): boolean {
    return _.includes([Route.Root, Route.SignIn, Route.Home, Route.AuthenticatedHome, Route.Vocabularies], route);
}
