import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsUrl, IsUUID, ValidateIf } from 'class-validator';

export default class Definition {
    @IsUUID()
    id: string;

    @IsUUID()
    vocabularyId: string;

    @IsNotEmpty({ message: `Please add a meaning. A definition without meaning isn't helpful.` })
    meaning: string;

    @IsArray({ message: `Add at least one example to show how this word is used.` })
    @ArrayNotEmpty({ message: `Add at least one example to show how this word is used.` })
    @IsNotEmpty({ each: true, message: `Examples can't be empty. Write a real sentence or remove it.` })
    examples: string[];

    @ValidateIf((definition) => !!definition.notes?.length)
    @IsNotEmpty({ each: true, message: `Notes can't be empty. Either add some context or remove the note.` })
    @IsArray({ message: `Notes can't be empty. Either add some context or remove the note.` })
    @IsOptional()
    notes?: string[];

    @ValidateIf((definition) => !!definition.externalLinks?.length)
    @IsUrl(undefined, { each: true, message: `That doesn't look like a valid URL. Please double-check the link.` })
    @IsArray()
    @IsOptional()
    externalLinks?: string[];
}
