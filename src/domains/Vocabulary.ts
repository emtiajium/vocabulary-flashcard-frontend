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

    @IsNotEmpty({ message: `Please enter a word. This field can't be left blank.` })
    word: string;

    @Type(() => Definition)
    @ValidateIf((vocabulary) => vocabulary.isDraft === false || !_.isEmpty(vocabulary.definitions))
    @ValidateNested({ each: true })
    @ArrayNotEmpty({
        message: `You need at least one definition. If you're not ready yet, save this as a draft instead.`,
    })
    @IsArray({ message: `You need at least one definition. If you're not ready yet, save this as a draft instead.` })
    definitions?: Definition[];

    @ValidateIf((vocabulary) => !!vocabulary.genericNotes?.length)
    @IsNotEmpty({ each: true, message: `Notes can't be empty. Either write something meaningful or remove the note.` })
    @IsArray({ message: `Notes can't be empty. Either write something meaningful or remove the note.` })
    @IsOptional()
    genericNotes?: string[];

    @ValidateIf((vocabulary) => !!vocabulary.genericExternalLinks?.length)
    @IsUrl(undefined, { each: true, message: `That doesn't look like a valid URL. Please double-check the link.` })
    @IsArray({ message: `That doesn't look like a valid URL. Please double-check the link.` })
    @IsOptional()
    genericExternalLinks?: string[];

    @ValidateIf((vocabulary) => !!vocabulary.linkerWords?.length)
    @IsNotEmpty({ each: true, message: `Linker words can't be empty. Remove it or add a real word.` })
    @IsArray({ message: `Linker words can't be empty. Remove it or add a real word.` })
    @IsOptional()
    linkerWords?: string[];

    @IsBoolean({ message: `Please specify whether this vocabulary is a draft or final.` })
    isDraft: boolean;

    @IsOptional()
    isInLeitnerBox?: boolean;
}

export type VocabularyExistenceResponse = Pick<Vocabulary, 'id' | 'word'>;
