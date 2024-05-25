export interface RandomlyChosenMeaningResponse {
    meaning: string;
    word: string;
    isCorrect?: boolean;
}

export interface CachedRandomlyChosenMeaningResponse {
    createdAt: string;

    data: RandomlyChosenMeaningResponse[];
}
