import Vocabulary from '@/domains/Vocabulary';
import DtoValidation from '@/utils/DtoValidation';

export default class VocabularyValidator {
    /**
     * Validates a vocabulary payload before it is sent to `POST /v1/vocabularies`,
     * nested definitions included.
     *
     * @throws {Error} with the first user-facing validation message
     */
    static validate(vocabulary: Vocabulary): void {
        DtoValidation.validate(Vocabulary, vocabulary);
    }
}
