import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import Pagination from '@/domains/Pagination';
import { Type } from 'class-transformer';
import Sort from '@/domains/Sort';

export default class VocabularySearch {
    @IsString()
    @IsOptional()
    searchKeyword?: string;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Pagination)
    pagination: Pagination;

    @ValidateNested()
    @IsOptional()
    @Type(() => Sort)
    sort?: Sort;
}
