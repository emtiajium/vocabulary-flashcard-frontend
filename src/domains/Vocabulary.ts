import Definition from '@/domains/Definition';
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsUrl,
    IsUUID,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import * as _ from 'lodash';

export default class Vocabulary {
    @IsUUID()
    id: string;

    @IsUUID()
    @IsOptional()
    cohortId?: string;

    @IsNotEmpty({ message: `The word should not be empty.` })
    word: string;

    @ValidateIf((vocabulary) => vocabulary.isDraft === false || !_.isEmpty(vocabulary.definitions))
    @ValidateNested({ each: true })
    @ArrayNotEmpty({
        message: `Definitions should not be empty. Alternatively, a vocabulary can be added without definitions in the draft mode.`,
    })
    @IsArray()
    @Type(() => Definition)
    definitions?: Definition[];

    @ValidateIf((vocabulary) => !!vocabulary.genericNotes?.length)
    @IsNotEmpty({ each: true })
    @IsArray()
    @IsOptional()
    genericNotes?: string[];

    @ValidateIf((vocabulary) => !!vocabulary.genericExternalLinks?.length)
    @IsUrl(undefined, { each: true, message: `Each generic external link should be a valid URL address.` })
    @IsArray()
    @IsOptional()
    genericExternalLinks?: string[];

    @ValidateIf((vocabulary) => !!vocabulary.linkerWords?.length)
    @IsNotEmpty({ each: true })
    @IsArray()
    @IsOptional()
    linkerWords?: string[];

    @IsBoolean()
    @IsDefined()
    isDraft: boolean;

    @IsOptional()
    isInLeitnerBox?: boolean;
}

export type VocabularyExistenceResponse = Pick<Vocabulary, 'id' | 'word'>;
