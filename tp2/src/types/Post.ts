import type { Usuario } from './Usuario';
import type { Tag } from './Tag';

export interface Post {
    id: number;
    description: string;
    UserId: number;
    createdAt: string;
    User?: Usuario;
    Tags?: Tag[];
}