import Pagination from '@/domains/Pagination';
import Sort from '@/domains/Sort';
import VocabularySearchCoverage from '@/domains/VocabularySearchCoverage';

export default class VocabularySearch {
    searchKeyword: string;

    vocabularySearchCoverage: VocabularySearchCoverage;

    fetchNotHavingDefinitionOnly: boolean;

    pagination: Pagination;

    sort: Sort;
}
