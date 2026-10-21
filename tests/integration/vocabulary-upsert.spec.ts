import Vocabulary from '@/domains/Vocabulary';
import VocabularyValidator from '@/utils/VocabularyValidator';
import {
    apiDefinitionPayload,
    apiVocabularyPayload,
    buildDefinitionInstance,
    buildVocabularyInstance,
} from '../fixtures/payloads';

describe('Vocabulary upsert payload validation (integration)', () => {
    describe('WHEN the vocabulary was loaded from the API (edit mode, plain objects)', () => {
        it('SHOULD accept the payload returned by GET /v1/vocabularies/:id', () => {
            expect(() => VocabularyValidator.validate(apiVocabularyPayload)).not.toThrow();
        });

        it('SHOULD still validate a nested definition instead of skipping it', () => {
            const payload = {
                ...apiVocabularyPayload,
                definitions: [{ ...apiDefinitionPayload, meaning: '' }],
            };

            expect(() => VocabularyValidator.validate(payload)).toThrow(/Please add a meaning/);
        });

        it('SHOULD reject a nested definition without examples', () => {
            const payload = {
                ...apiVocabularyPayload,
                definitions: [{ ...apiDefinitionPayload, examples: [] }],
            };

            expect(() => VocabularyValidator.validate(payload)).toThrow(/Add at least one example/);
        });

        it('SHOULD reject an invalid nested external link', () => {
            const payload = {
                ...apiVocabularyPayload,
                definitions: [{ ...apiDefinitionPayload, externalLinks: ['not-a-url'] }],
            };

            expect(() => VocabularyValidator.validate(payload)).toThrow(/doesn't look like a valid URL/);
        });

        it('SHOULD reject an empty nested note', () => {
            const payload = {
                ...apiVocabularyPayload,
                definitions: [{ ...apiDefinitionPayload, notes: [''] }],
            };

            expect(() => VocabularyValidator.validate(payload)).toThrow(/Notes can't be empty/);
        });
    });

    describe('WHEN creating a vocabulary (payload built from domain instances)', () => {
        it('SHOULD accept a complete vocabulary', () => {
            expect(() => VocabularyValidator.validate(buildVocabularyInstance())).not.toThrow();
        });

        it('SHOULD accept a draft without any definition', () => {
            const payload = buildVocabularyInstance({ definitions: [], isDraft: true });

            expect(() => VocabularyValidator.validate(payload)).not.toThrow();
        });

        it('SHOULD accept a draft without definitions and without linker words', () => {
            const payload = buildVocabularyInstance({ definitions: [], linkerWords: [], isDraft: true });

            expect(() => VocabularyValidator.validate(payload)).not.toThrow();
        });

        it('SHOULD still validate the definitions of a draft when they are present', () => {
            const payload = buildVocabularyInstance({
                isDraft: true,
                definitions: [buildDefinitionInstance({ meaning: '' })],
            });

            expect(() => VocabularyValidator.validate(payload)).toThrow(/Please add a meaning/);
        });
    });

    describe('WHEN only one definition was edited (instances mixed with API objects)', () => {
        it('SHOULD accept the mixed payload', () => {
            const editedDefinition = buildDefinitionInstance({ meaning: 'An illuminating realization.' });
            const payload = {
                ...apiVocabularyPayload,
                definitions: [apiDefinitionPayload, editedDefinition],
            };

            expect(() => VocabularyValidator.validate(payload)).not.toThrow();
        });

        it('SHOULD reject the mixed payload when the edited instance is invalid', () => {
            const editedDefinition = buildDefinitionInstance({ examples: [] });
            const payload = {
                ...apiVocabularyPayload,
                definitions: [apiDefinitionPayload, editedDefinition],
            };

            expect(() => VocabularyValidator.validate(payload)).toThrow(/Add at least one example/);
        });
    });

    describe('WHEN the vocabulary itself is invalid', () => {
        it('SHOULD reject a blank word', () => {
            expect(() => VocabularyValidator.validate({ ...apiVocabularyPayload, word: '' })).toThrow(
                "Please enter a word. This field can't be left blank.",
            );
        });

        it('SHOULD reject a final vocabulary without definitions', () => {
            expect(() => VocabularyValidator.validate({ ...apiVocabularyPayload, definitions: [] })).toThrow(
                /at least one definition/,
            );
        });

        it('SHOULD reject an empty linker word', () => {
            expect(() => VocabularyValidator.validate({ ...apiVocabularyPayload, linkerWords: [''] })).toThrow(
                /Linker words can't be empty/,
            );
        });

        it('SHOULD reject an empty generic note', () => {
            expect(() => VocabularyValidator.validate({ ...apiVocabularyPayload, genericNotes: [''] })).toThrow(
                /Notes can't be empty/,
            );
        });

        it('SHOULD reject an invalid generic external link', () => {
            const payload = { ...apiVocabularyPayload, genericExternalLinks: ['not-a-url'] };

            expect(() => VocabularyValidator.validate(payload)).toThrow(/doesn't look like a valid URL/);
        });

        it('SHOULD throw an Error carrying a user-facing message', () => {
            let thrown: Error | undefined;
            try {
                VocabularyValidator.validate({ ...apiVocabularyPayload, word: '' });
            } catch (error) {
                thrown = error as Error;
            }

            expect(thrown).toBeInstanceOf(Error);
            expect(thrown?.message).toBeTruthy();
        });
    });

    describe('WHEN the same vocabulary is validated as plain JSON and as an instance', () => {
        it('SHOULD produce the same outcome', () => {
            const asInstance = buildVocabularyInstance();
            const asPlain = {
                ...asInstance,
                definitions: asInstance.definitions?.map((definition) => ({ ...definition })),
            };

            expect(() => VocabularyValidator.validate(asInstance)).not.toThrow();
            expect(() => VocabularyValidator.validate(asPlain as Vocabulary)).not.toThrow();
        });
    });
});
