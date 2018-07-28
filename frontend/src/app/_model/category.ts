import { SubCategory } from './sub-category.model';

export class Category {
    id?: string;
    name: string;
    description?: string;
    count: number;
    sub: SubCategory[];
};