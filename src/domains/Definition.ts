import {
    ArrayNotEmpty,
    IsArray,
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    ValidateIf,
} from 'class-validator';

export default class Definition {
    @IsUUID()
    @IsNotEmpty()
    @IsDefined()
    id: string;

    @IsUUID()
    @IsNotEmpty()
    @IsDefined()
    vocabularyId: string;

    @IsString()
    @IsNotEmpty()
    @IsDefined()
    meaning: string;

    @IsNotEmpty({ each: true })
    @ArrayNotEmpty()
    @IsArray()
    @IsDefined()
    examples?: string[];

    @ValidateIf((definition) => !!definition.notes?.length)
    @IsNotEmpty({ each: true })
    @IsArray()
    @IsOptional()
    notes?: string[];

    @ValidateIf((definition) => !!definition.externalLinks?.length)
    @IsUrl(undefined, { each: true, message: `Each external link must be a URL address` })
    @IsArray()
    @IsOptional()
    externalLinks?: string[];
}
