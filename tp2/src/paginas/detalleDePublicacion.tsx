import { useParams } from "react-router-dom";
import type { Post } from "../types/Post";
import type { PostImagen } from "../types/PostImagen";
import type {Comentario} from "../types/Comentario";
import type { Usuario } from "../types/Usuario";
import { useState, useEffect } from "react";

function detalleDePublicacion() {
  const { id } = useParams<{ id: string }>();

  const [publicacion, setPublicacion] = useState<Post | null>(null);

  const [imagenes, setImagenes] = useState<PostImagen[]>([]);

  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  const [autorPost, setAutorPost] = useState<Usuario | null>(null);

  const [cargando, setCargando] = useState<boolean>(true);

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    setCargando(true);

    const obtenerPublicacion = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/posts/${id}`);
        if (!respuesta.ok) {
          throw new Error("Error al obtener la publicación");
        }
        const publicacionData = await respuesta.json();

        if (!cancelado) {
          setPublicacion(publicacionData);
          setImagenes(publicacionData.Imagenes || []);
          setComentarios(publicacionData.Comments || []);
          setAutorPost(publicacionData.User || null);
        }
      } catch (error) {
        console.error("Error al obtener la publicación:", error);
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    obtenerPublicacion();

    return () => {
      cancelado = true;
    };
  }, [id]);

  function renderImagenes() {
    if (imagenes.length === 0) {
      return <li>No hay imágenes disponibles</li>;
    }
    return imagenes.map((imagen) => (
      <li key={imagen.id}>
        <img src={imagen.url} alt={`Imagen ${imagen.id}`} />
      </li>
    ));
  }

  async function crearComentario() {
    const contenidoComentario = prompt("Ingrese el contenido del comentario:");
    if (contenidoComentario) {
      // Ideal: obtener el id del usuario logueado desde tu contexto de autenticación
      const nuevoComentario: Comentario = {
        id: 0,
        content: contenidoComentario.trim(),
        createdAt: new Date().toISOString(),
        PostId: Number(id),
        UserId: autorPost ? autorPost.id : 0,
      };
      try {
        const respuesta = await fetch(`${API_URL}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoComentario),
        });
        if (!respuesta.ok) {
          throw new Error("Error al crear el comentario");
        }
        const comentarioCreado = await respuesta.json();
        setComentarios(prevComentarios => [...prevComentarios, comentarioCreado]);
      } catch (error) {
        console.error("Error al crear el comentario:", error);
      }
    }

    if (cargando) {
      return <p>Cargando publicacion...</p>;
    }

    if (!publicacion) {
      return <p>No se encontró la publicación.</p>;
    }
  }


  return (
    <div>
      <h1>Detalle de Publicación</h1>
      <p>ID de la publicación: {id}</p>
      <p>Imágenes:</p>
      <ul>
        {renderImagenes()}
      </ul>
      <p>Descripción: {publicacion?.description}</p>
      <p>Creado por: {autorPost?.nickName ?? publicacion?.User?.nickName}</p>
      <p>Fecha de creación: {publicacion?.createdAt}</p>
      <p>Tags: {publicacion?.Tags?.map((tag) => tag.name).join(", ")}</p>
      <p>Comentarios: </p>
      <ul>
        {comentarios.length > 0 ? (
          comentarios.map((comentario, index) => (
            <li key={comentario.id ?? index}>
              {comentario.content}
            </li>
          ))
        ) : (
          <li>No hay comentarios disponibles</li>
        )}
      </ul>
      <button onClick={crearComentario}>Agregar Comentario</button>

    </div>
  );
}

export default detalleDePublicacion;