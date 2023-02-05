import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsUrl, IsUUID, ValidateIf } from 'class-validator';

export default class Definition {
    @IsUUID()
    id: string;

    @IsUUID()
    vocabularyId: string;

    @IsNotEmpty({ message: `The meaning should not be empty.` })
    meaning: string;

    @IsNotEmpty({ each: true })
    @ArrayNotEmpty({ message: `Examples should not be empty.` })
    @IsArray()
    examples: string[];

    @ValidateIf((definition) => !!definition.notes?.length)
    @IsNotEmpty({ each: true })
    @IsArray()
    @IsOptional()
    notes?: string[];

    @ValidateIf((definition) => !!definition.externalLinks?.length)
    @IsUrl(undefined, { each: true, message: `Each external link should be a valid URL address.` })
    @IsArray()
    @IsOptional()
    externalLinks?: string[];
}
