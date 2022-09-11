import Definition from '@/domains/Definition';
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import * as _ from 'lodash';

export type VocabularyExistenceResponse = Pick<Vocabulary, 'id' | 'word'>;

export default class Vocabulary {
    @IsUUID()
    @IsNotEmpty()
    @IsDefined()
    id: string;

    @IsUUID()
    @IsOptional()
    cohortId?: string;

    @IsString()
    @IsNotEmpty()
    @IsDefined()
    word: string;

    @ValidateIf((vocabulary) => vocabulary.isDraft === false || !_.isEmpty(vocabulary.definitions))
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @IsArray()
    @Type(() => Definition)
    definitions?: Definition[];

    @ValidateIf((vocabulary) => !!vocabulary.genericNotes?.length)
    @IsNotEmpty({ each: true })
    @IsArray()
    @IsOptional()
    genericNotes?: string[];

    @ValidateIf((vocabulary) => !!vocabulary.genericExternalLinks?.length)
    @IsUrl(undefined, { each: true, message: `Each generic external link must be a URL address` })
    @IsArray()
    @IsOptional()
    genericExternalLinks?: string[];

    @ValidateIf((vocabulary) => !!vocabulary.genericNotes?.length)
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
