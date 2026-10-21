import { filter, flatMap } from 'lodash';
import { ValidationError } from 'class-validator';

export default class ValidationErrorTransform {
    static prependConstraintsWithParentProp(parentError: ValidationError, error: ValidationError): ValidationError {
        const constraints: Record<string, string> = {};
        for (let i = 0; i < Object.keys(error.constraints || {}).length; i++) {
            const key: string = Object.keys(error.constraints || {})[i];
            constraints[key] = `${parentError.property}.${(error.constraints || {})[key]}`;
        }
        return {
            ...error,
            constraints,
        };
    }

    static mapChildrenToValidationErrors(error: ValidationError): ValidationError[] {
        if (!error.children || error.children.length === 0) {
            return [error];
        }
        return ValidationErrorTransform.getValidationError(error);
    }

    static getValidationError(error: ValidationError): ValidationError[] {
        const validationErrors = [];
        for (let i = 0; i < (error.children || []).length; i++) {
            const item = (error.children || [])[i];
            if (item.children && item.children.length > 0) {
                validationErrors.push(...ValidationErrorTransform.mapChildrenToValidationErrors(item));
            }
            validationErrors.push(ValidationErrorTransform.prependConstraintsWithParentProp(error, item));
        }
        return validationErrors;
    }

    static transform(validationErrors: ValidationError[]): string[] {
        const nestedErrors = flatMap(validationErrors, (error) =>
            ValidationErrorTransform.mapChildrenToValidationErrors(error),
        );

        return flatMap(
            filter(nestedErrors, (item) => !!item.constraints),
            (item) => Object.values(item.constraints || {}),
        );
    }
}
