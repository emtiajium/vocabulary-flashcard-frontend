import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import ValidationErrorTransform from '@/utils/ValidationErrorTransform';

/**
 * Shared entry point for validating request payloads before they are sent to the API.
 *
 * Payloads are not always made of class instances: anything loaded from the API is plain
 * JSON, nested objects included. `class-validator` only applies the `@Type(...)` metadata
 * of nested properties when validation runs on class instances, so the payload is
 * transformed first - otherwise nested objects are reported as unknown values and the
 * save fails even though the payload is valid.
 */
export default class DtoValidation {
    /**
     * @throws {Error} with the first user-facing validation message
     */
    static validate<T extends object>(type: ClassConstructor<T>, payload: object): void {
        const [firstError] = ValidationErrorTransform.transform(validateSync(plainToInstance(type, payload)));
        if (firstError) {
            throw new Error(firstError);
        }
    }
}
