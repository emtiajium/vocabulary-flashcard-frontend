import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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

    @ArrayNotEmpty()
    @IsArray()
    @IsDefined()
    examples?: string[];

    @IsArray()
    @IsOptional()
    notes?: string[];

    @IsArray()
    @IsOptional()
    externalLinks?: string[];
}
