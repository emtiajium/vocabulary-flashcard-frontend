import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import Pagination from '@/domains/Pagination';
import { Type } from 'class-transformer';
import Sort from '@/domains/Sort';

export default class VocabularySearch {
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Pagination)
    pagination: Pagination;

    @ValidateNested()
    @IsOptional()
    @Type(() => Sort)
    sort?: Sort;
}
