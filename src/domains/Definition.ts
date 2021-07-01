import {
    ArrayNotEmpty,
    IsArray,
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateIf,
} from 'class-validator';
import IsArrayContainsOnlyUrl from '@/validators/IsArrayContainsOnlyUrl';

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

    @ValidateIf((definition) => !!definition.externalLinks)
    @IsArrayContainsOnlyUrl()
    @IsArray()
    @IsOptional()
    externalLinks?: string[];
}
