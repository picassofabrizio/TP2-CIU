import type { Usuario } from './Usuario';

export interface Comentario {
    id: number;
    content: string;
    createdAt: string;
    PostId: number;
    UserId: number;
    User?: Usuario;
}