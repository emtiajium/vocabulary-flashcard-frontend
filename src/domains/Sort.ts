export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum SupportedSortFields {
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
    word = 'word',
}

export default class Sort {
    field: string;

    direction: SortDirection;

    constructor(field?: string, direction?: SortDirection) {
        this.field = field || SupportedSortFields.createdAt;
        this.direction = direction || SortDirection.DESC;
    }
}
