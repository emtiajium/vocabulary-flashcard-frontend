import Sort from '@/domains/Sort';

export default interface VocabSettings {
    sort: Sort;
    fetchNotHavingDefinitionOnly: boolean;
}
