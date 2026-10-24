'use strict';

/**
 * Deterministic demo data used while capturing Play Store screenshots.
 *
 * Nothing here talks to a real backend. `capture.cjs` intercepts every request
 * that targets the API and answers with these fixtures, so the screenshots are
 * reproducible on any machine and never leak real users' data.
 */

const VOCABULARY_ID = '11111111-1111-4111-8111-111111111111';

const searchResults = [
    {
        word: 'Debris',
        isInLeitnerBox: false,
        definitions: [{ meaning: 'broken or torn pieces left from the destruction of something larger' }],
    },
    {
        word: 'Epiphany',
        isInLeitnerBox: true,
        definitions: [
            {
                meaning:
                    'A moment when you suddenly feel that you understand, or suddenly become conscious of, something that is very important to you',
            },
        ],
    },
    {
        word: 'Black swan',
        isInLeitnerBox: true,
        definitions: [
            {
                meaning:
                    'a metaphor that describes an event that comes as a surprise, has a major effect and is often inappropriately rationalised after the fact with the benefit of hindsight.',
            },
        ],
    },
    {
        word: 'Ambidextrous',
        isInLeitnerBox: false,
        definitions: [{ meaning: 'Able to use right and left hand equally well' }, { meaning: 'Versatile (সব্যসাচী)' }],
    },
    {
        word: 'Whiplash',
        isInLeitnerBox: true,
        definitions: [
            { meaning: 'চাবুকাঘাত ' },
            {
                meaning:
                    'A neck injury occurs when the neck and head are suddenly forced backwards and then forward, putting the cervical spine through lightning-quick motions and extreme stresses ',
            },
        ],
    },
    {
        word: 'Pedagogy',
        isInLeitnerBox: false,
        definitions: [{ meaning: 'Art and science of teaching' }],
    },
    {
        word: 'Drop like a hot potato',
        isInLeitnerBox: true,
        definitions: [
            {
                meaning:
                    'Quickly stop being involved with someone or something because you stop liking this person or thing',
            },
        ],
    },
    {
        word: 'Clutch',
        isInLeitnerBox: false,
        definitions: [{ meaning: 'Grasp (something) tightly' }],
    },
    {
        word: 'Porpoise',
        isInLeitnerBox: true,
        definitions: [
            {
                meaning:
                    '(Noun) a mammal that lives in the sea, swims in groups, and looks similar to a dolphin but has a shorter rounder nose',
            },
            { meaning: '(Verb) move through the water like a porpoise, alternately rising above it and submerging.' },
        ],
    },
    {
        word: 'Juxtaposition',
        isInLeitnerBox: true,
        definitions: [
            {
                meaning:
                    'an act or instance of placing two elements close together or side by side (তুলনা করার বিদ্যা)',
            },
        ],
    },
];
const buildSearchResponse = () => ({
    total: 230,
    results: searchResults.map((entry, index) => ({
        id: `22222222-2222-4222-8222-${String(index + 1).padStart(12, '0')}`,
        word: entry.word,
        isInLeitnerBox: entry.isInLeitnerBox,
        definitions: entry.definitions.map((definition, definitionIndex) => ({
            id: `33333333-3333-4333-8333-${String(index + 1).padStart(6, '0')}${String(definitionIndex + 1).padStart(
                6,
                '0',
            )}`,
            meaning: definition.meaning,
        })),
    })),
});

const carrionVocabulary = {
    id: VOCABULARY_ID,
    word: 'Carrion',
    isDraft: false,
    isInLeitnerBox: true,
    definitions: [
        {
            id: '11111111-1111-4111-5111-111111111111',
            vocabularyId: VOCABULARY_ID,
            meaning: 'the decaying (= becoming destroyed by natural processes) bodies of dead animals (গলিত মাংস)',
            examples: [
                'A crow wheeled over the hills in search of carrion.',
                'Carrion is an important food source for large carnivores and omnivores in most ecosystems, for example, crows, vultures, etc.',
            ],
            notes: [],
            externalLinks: [],
        },
    ],
    linkerWords: [],
    genericNotes: [
        'Carrion flower: A flower that gives off a smell similar to rotting meat. <br /><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1xMjkUmKA2GHqvnKk2Xw8m26u2MENbNvgNQ&usqp=CAU" />',
    ],
    genericExternalLinks: [],
};

const cohort = {
    name: 'Fantastic Four!',
    users: [
        {
            name: 'Joao da Silva',
            username: 'jsilva@firecrackervocabulary.com',
            profilePictureUrl:
                'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairDreads01&accessoriesType=Prescription01&hairColor=Brown&facialHairType=Blank&clotheType=Hoodie&clotheColor=Gray02&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Brown',
        },
        {
            name: 'Kateryna Lagno',
            username: 'klagno@firecrackervocabulary.com',
            profilePictureUrl:
                'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairCurvy&accessoriesType=Blank&hairColor=Blonde&facialHairType=Blank&clotheType=Overall&clotheColor=PastelGreen&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
        },
        {
            name: 'Shashwata Noor',
            username: 'snoor@firecrackervocabulary.com',
            profilePictureUrl:
                'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortFlat&accessoriesType=Blank&hairColor=Black&facialHairType=BeardLight&facialHairColor=Black&clotheType=BlazerSweater&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=DarkBrown',
        },
        {
            name: 'Shraban Dhara',
            username: 'sdhara@firecrackervocabulary.com',
            profilePictureUrl:
                'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairStraight2&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=CollarSweater&clotheColor=Blue03&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Brown',
        },
    ],
};

const guessingGame = [{ meaning: 'The ability to understand and decide things quickly and well.', word: 'Acumen' }];

const leitnerCounts = { 1: 24, 2: 12, 3: 8, 4: 5, 5: 3 };

module.exports = {
    VOCABULARY_ID,
    buildSearchResponse,
    carrionVocabulary,
    cohort,
    guessingGame,
    leitnerCounts,
};
