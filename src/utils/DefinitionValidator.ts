import Definition from '@/domains/Definition';
import DtoValidation from '@/utils/DtoValidation';

export default class DefinitionValidator {
    /**
     * Validates a definition payload before it is handed back to the vocabulary view.
     *
     * @throws {Error} with the first user-facing validation message
     */
    static validate(definition: Definition): void {
        DtoValidation.validate(Definition, definition);
    }
}
