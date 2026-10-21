import Definition from '@/domains/Definition';
import Vocabulary from '@/domains/Vocabulary';

/**
 * A definition exactly as it is returned by `GET /v1/vocabularies/:id`:
 * plain JSON, not a `Definition` instance.
 */
export const apiDefinitionPayload: Definition = {
    id: 'ecbb9049-7f47-482e-8b6c-1a68d0f14a63',
    vocabularyId: '0cbc44a7-cf93-4358-b454-60267f1ea56f',
    meaning: '(Pop-culture) To express excitement when something exciting occurs. ',
    examples: ['Project 550 was successful. Poggers!'],
    notes: [],
    externalLinks: [],
};

/**
 * The payload that broke production: a vocabulary loaded for editing, so the
 * nested definitions are plain JSON objects rather than `Definition` instances.
 */
export const apiVocabularyPayload: Vocabulary = {
    id: '0cbc44a7-cf93-4358-b454-60267f1ea56f',
    word: 'Poggers',
    definitions: [apiDefinitionPayload],
    genericNotes: [],
    genericExternalLinks: [],
    linkerWords: ['Epiphany'],
    isDraft: false,
};

export function buildDefinitionInstance(overrides: Partial<Definition> = {}): Definition {
    const definition = new Definition();
    definition.id = 'ecbb9049-7f47-482e-8b6c-1a68d0f14a63';
    definition.vocabularyId = '0cbc44a7-cf93-4358-b454-60267f1ea56f';
    definition.meaning = '(Pop-culture) To express excitement when something exciting occurs.';
    definition.examples = ['Project 550 was successful. Poggers!'];
    definition.notes = [];
    definition.externalLinks = [];
    return Object.assign(definition, overrides);
}

/**
 * A vocabulary as it is built by the upsert view in creation mode: the view
 * creates real `Vocabulary`/`Definition` instances.
 */
export function buildVocabularyInstance(overrides: Partial<Vocabulary> = {}): Vocabulary {
    const vocabulary = new Vocabulary();
    vocabulary.id = '0cbc44a7-cf93-4358-b454-60267f1ea56f';
    vocabulary.word = 'Poggers';
    vocabulary.definitions = [buildDefinitionInstance()];
    vocabulary.genericNotes = [];
    vocabulary.genericExternalLinks = [];
    vocabulary.linkerWords = ['Epiphany'];
    vocabulary.isDraft = false;
    return Object.assign(vocabulary, overrides);
}
