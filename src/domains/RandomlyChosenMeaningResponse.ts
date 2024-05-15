export interface RandomlyChosenMeaningResponse {
    meaning: string;
    word: string;
}

export interface CachedRandomlyChosenMeaningResponse {
    createdAt: string;

    data: RandomlyChosenMeaningResponse[];
}
