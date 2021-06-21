import Definition from '@/domains/Definition';
import {
    IsArray,
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsString,
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
    @IsNotEmpty()
    @IsDefined()
    cohortId: string;

    @IsString()
    @IsNotEmpty()
    @IsDefined()
    word: string;

    @ValidateIf((vocabulary) => vocabulary.isDraft === false)
    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => Definition)
    definitions?: Definition[];

    @IsArray()
    @IsOptional()
    genericNotes?: string[];

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
