import SearchResult from '@/domains/SearchResult';
import LeitnerBoxItem from '@/domains/LeitnerBoxItem';

export type SingleLeitnerItemEarlierToBoxAppearanceDate = { boxAppearanceDate: Date; vocabulary: { word: string } };

export default class LeitnerBoxItemSearchResult extends SearchResult<LeitnerBoxItem> {
    constructor(
        readonly results: LeitnerBoxItem[],
        readonly total: number,
        readonly singleLeitnerItemEarlierToBoxAppearanceDate: SingleLeitnerItemEarlierToBoxAppearanceDate,
    ) {
        super(results, total);
    }
}
