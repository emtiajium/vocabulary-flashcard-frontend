import Definition from '@/domains/Definition';

export default class Vocabulary {
    id: string;

    cohortId: string;

    word: string;

    definitions?: Definition[];

    genericNotes?: string[];

    genericExternalLinks?: string[];

    linkerWords?: string[];

    isDraft: boolean;
}
