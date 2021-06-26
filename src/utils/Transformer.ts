import _ from 'lodash';

export default class Transformer {
    // https://v3.vuejs.org/guide/reactivity.html
    // https://v3.vuejs.org/api/basic-reactivity.html
    static proxyObjectToPlainObject<T>(proxyObject: unknown): T {
        return _.cloneDeep(proxyObject) as T;
    }
}
