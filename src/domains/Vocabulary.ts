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

    @ValidateIf((vocabulary) => vocabulary.isDraft === false)
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @IsArray()
    @Type(() => Definition)
    definitions?: Definition[];

    @IsArray()
    @IsOptional()
    genericNotes?: string[];

    @ValidateIf((vocabulary) => !!vocabulary.genericExternalLinks)
    @IsUrl(undefined, { each: true })
    @IsArray()
    @IsOptional()
    genericExternalLinks?: string[];

    @IsArray()
    @IsOptional()
    linkerWords?: string[];

    @IsBoolean()
    @IsDefined()
    isDraft: boolean;
}
