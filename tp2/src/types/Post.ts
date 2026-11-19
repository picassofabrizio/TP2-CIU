import type { Usuario } from './Usuario';
import type { Tag } from './Tag';
import type { PostImagen } from './PostImagen';
import type { Comentario } from './Comentario';

export interface Post {
    id: number;
    description: string;
    UserId: number;
    createdAt: string;
    User?: Usuario;
    Tags?: Tag[];
    Comments?: Comentario[];
    Imagenes?: PostImagen[];
}