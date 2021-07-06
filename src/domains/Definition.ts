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

    @IsArray()
    @IsOptional()
    notes?: string[];

    @ValidateIf((definition) => !!definition.externalLinks)
    @IsUrl(undefined, { each: true })
    @IsArray()
    @IsOptional()
    externalLinks?: string[];
}
