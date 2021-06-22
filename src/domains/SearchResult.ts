export default class SearchResult<T> {
    // eslint-disable-next-line no-useless-constructor,no-empty-function
    constructor(readonly results: T[], readonly total: number) {}
}
