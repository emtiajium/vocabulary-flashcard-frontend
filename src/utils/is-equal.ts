import * as _ from 'lodash';

export function isArrayOfStringEqual(firstArray: string[], secondArray: string[]): boolean {
    return firstArray.length === secondArray.length ? _.difference(firstArray, secondArray).length > 0 : true;
}

export function isArrayOfObjectEqual<T>(firstPOJO: T[], secondPOJO: T[]): boolean {
    return firstPOJO.length === secondPOJO.length
        ? !!_.find(firstPOJO, (plainObject, index) => {
              return !_.isEqual(plainObject, secondPOJO[index]);
          })
        : true;
}

export function isObjectEqual<T>(firstPOJO: T, secondPOJO: T): boolean {
    return _.isEqual(firstPOJO, secondPOJO);
}
