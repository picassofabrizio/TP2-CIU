import { useParams } from "react-router-dom";
import type { Post } from "../types/Post";
import type { PostImagen } from "../types/PostImagen";
import type {Comentario} from "../types/Comentario";
import type { Usuario } from "../types/Usuario";
import { useState } from "react";

function detalleDePublicacion() {
  const { id } = useParams<{ id: string }>();

  const [publicacion, setPublicacion] = useState<Post | null>(null);

  const [imagenes, setImagenes] = useState<PostImagen[]>([]);

  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const API_URL = "http://localhost:3001";

  const postComentarios = "http://localhost:3001/POST/comments/";

  async function obtenerPublicacion() {
    try {
      const respuesta = await fetch(`${API_URL}/posts/${id}`);
      const publicacion = await respuesta.json();
      setPublicacion(publicacion);
      setImagenes(publicacion.Imagenes || []);
      setComentarios(publicacion.Comments || []);
      setUsuario(publicacion.User || null);
    } catch (error) {
      console.error("Error al obtener la publicación:", error);
    }
  }

  function obtenerImagenes() {
    if (imagenes.length === 0) {
      return <li>No hay imágenes disponibles</li>;
    }
    return imagenes.map((imagen) => (
      <li key={imagen.id}>
        <img src={imagen.url} alt={`Imagen ${imagen.id}`} />
      </li>
    ));
  }

  function crearComentario() {
    const contenidoComentario = prompt("Ingrese el contenido del comentario:");
    <input type="text" placeholder="Ingrese el contenido del comentario" />;
    if (contenidoComentario) {
      const nuevoComentario: Comentario = {
        id: comentarios.length + 1, // Generar un ID único para el comentario
        content: contenidoComentario,
        createdAt: new Date().toISOString(),
        PostId: Number(id),
        UserId: usuario ? usuario.id : 0, // Asignar el ID del usuario actual si está disponible
      };
      fetch(`${postComentarios}${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoComentario),
      })
        .then((response) => response.json())
        .then((comentarioCreado) => {
          setComentarios([...comentarios, comentarioCreado]);
        });
    }
  }

  return (
    <div>
      <h1>Detalle de Publicación</h1>
      <button onClick={obtenerPublicacion}>Cargar Publicación</button>
      <p>ID de la publicación: {id}</p>
      <p>Imágenes:</p>
      <ul>
        {obtenerImagenes()}
      </ul>
      <p>Descripción: {publicacion?.description}</p>
      <p>Creado por: {publicacion?.User?.nickName}</p>
      <p>Fecha de creación: {publicacion?.createdAt}</p>
      <p>Tags: {publicacion?.Tags?.map((tag) => tag.name).join(", ")}</p>
      <p>Comentarios: </p>
      <ul>
        {publicacion?.Comments?.map((comment) => (
          <li>{comment.content}</li>
        ))}
      </ul>
      <button onClick={crearComentario}>Agregar Comentario</button>

    </div>
  );
}

export default detalleDePublicacion;