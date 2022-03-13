import Sort from '@/domains/Sort';
import VocabularySearchCoverage from '@/domains/VocabularySearchCoverage';

export default interface VocabSettings {
    sort: Sort;
    fetchNotHavingDefinitionOnly: boolean;
    vocabularySearchCoverage: VocabularySearchCoverage;
}
