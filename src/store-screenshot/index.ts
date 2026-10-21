import NativeStorage from '@/utils/NativeStorage';
import User from '@/domains/User';
import VocabSettings from '@/domains/VocabSettings';
import Sort, { SortDirection, SupportedSortFields } from '@/domains/Sort';
import VocabularySearchCoverage from '@/domains/VocabularySearchCoverage';

/**
 * Development-only helper that lets the Play Store screenshot pipeline land on
 * authenticated screens without going through Google Sign-In.
 *
 * It is activated exclusively at build time via `VUE_APP_STORE_SCREENSHOTS=true`
 * (see `scripts/play-store/capture.cjs`). In every other build the flag is
 * undefined, so `isStoreScreenshotMode()` returns `false` and none of this code
 * runs. It never ships in the production app.
 */
export const STORE_SCREENSHOT_TOKEN = 'store-screenshot-session-token';

const DEMO_USER: User = {
    username: 'demo@firecrackervocabulary.com',
    firstname: 'Demo',
    lastname: 'Learner',
    name: 'Demo Learner',
    profilePictureUrl: '/assets/icon/firecracker-icon.png',
};

const DEMO_VOCAB_SETTINGS: VocabSettings = {
    sort: new Sort(SupportedSortFields.updatedAt, SortDirection.DESC),
    fetchNotHavingDefinitionOnly: false,
    fetchFlashcard: true,
    vocabularySearchCoverage: Object.assign(new VocabularySearchCoverage(), {
        word: true,
        linkerWords: false,
        genericNotes: false,
        meaning: false,
        examples: false,
        notes: false,
    }),
};

export function isStoreScreenshotMode(): boolean {
    return process.env.VUE_APP_STORE_SCREENSHOTS === 'true';
}

export async function startStoreScreenshotSession(): Promise<void> {
    await NativeStorage.setAuthorizedUser(DEMO_USER);
    await NativeStorage.setJwToken(STORE_SCREENSHOT_TOKEN);
    await NativeStorage.setVocabSettings(DEMO_VOCAB_SETTINGS);
}
