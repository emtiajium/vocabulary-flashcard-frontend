import { isDefined, isURL, registerDecorator } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectLiteral = Record<string, any>;

export default function IsArrayContainsOnlyUrl<T>(): PropertyDecorator {
    return function validator(object: ObjectLiteral, propertyName: string | symbol): void {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName.toString(),
            options: { message: `${propertyName.toString()} must contains only URLs` },
            constraints: [],
            validator: {
                validate(values: T[]): boolean {
                    if (isDefined(values) && !Array.isArray(values)) {
                        return false;
                    }
                    let isContainUrl = true;
                    values.forEach((value) => {
                        isContainUrl = isContainUrl && isURL(value as unknown as string);
                    });
                    return isContainUrl;
                },
            },
        });
    };
}
