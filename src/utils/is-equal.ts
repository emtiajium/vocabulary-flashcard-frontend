import { difference, find, isEqual } from 'lodash';

export function isArrayOfStringEqual(firstArray: string[], secondArray: string[]): boolean {
    return firstArray.length === secondArray.length ? difference(firstArray, secondArray).length > 0 : true;
}

export function isArrayOfObjectEqual<T>(firstPOJO: T[], secondPOJO: T[]): boolean {
    return firstPOJO.length === secondPOJO.length
        ? !!find(firstPOJO, (plainObject, index) => {
              return !isEqual(plainObject, secondPOJO[index]);
          })
        : true;
}

export function isObjectEqual<T>(firstPOJO: T, secondPOJO: T): boolean {
    return isEqual(firstPOJO, secondPOJO);
}
