import { useParams } from "react-router-dom";
import type { Post } from "../types/Post";
import type { PostImagen } from "../types/PostImagen";
import type { Comentario } from "../types/Comentario";
import type { Usuario } from "../types/Usuario";
import { useState, useEffect, useContext } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext";

function DetalleDePublicacion() {
  //* Leemos el :id de la URL (/detalle/:id)
  const { id } = useParams<{ id: string }>();

  //* Usuario logueado (para saber quién comenta)
  const contexto = useContext(UsuarioContext);
  const usuario = contexto?.usuario;

  //* Datos de la publicación, sus imágenes, comentarios y autor
  const [publicacion, setPublicacion] = useState<Post | null>(null);

  const [imagenes, setImagenes] = useState<PostImagen[]>([]);

  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  const [autorPost, setAutorPost] = useState<Usuario | null>(null);

  //* Indica si todavía estamos esperando la respuesta del backend
  const [cargando, setCargando] = useState<boolean>(true);

  //* Estados del formulario de comentarios (componente controlado)
  const [textoComentario, setTextoComentario] = useState(""); // lo que escribe el usuario
  const [errorComentario, setErrorComentario] = useState<string | null>(null); // mensaje de error
  const [enviando, setEnviando] = useState(false); // deshabilita el botón mientras se envía

  const API_URL = "http://localhost:3001";

  //* Al entrar (o cambiar el id), pedimos los datos al backend
  useEffect(() => {
    if (!id) return;

    //* Evita actualizar el estado si el componente se desmontó antes de recibir la respuesta
    let cancelado = false;
    setCargando(true);

    const obtenerPublicacion = async () => {
      try {
        //* Pedimos las tres cosas en paralelo, cada una en su ruta
        const [resPost, resComentarios, resImagenes] = await Promise.all([
          fetch(`${API_URL}/posts/${id}`),
          fetch(`${API_URL}/comments/post/${id}`),
          fetch(`${API_URL}/postimages/post/${id}`),
        ]);

        //* Si el post no existe, cortamos con un error
        if (!resPost.ok) {
          throw new Error("Error al obtener la publicación");
        }

        //* Comentarios e imágenes son opcionales: si fallan, usamos una lista vacía
        const publicacionData = await resPost.json();
        const comentariosData = resComentarios.ok ? await resComentarios.json() : [];
        const imagenesData = resImagenes.ok ? await resImagenes.json() : [];

        //* Guardamos todo en el estado (solo si seguimos en esta pantalla)
        if (!cancelado) {
          setPublicacion(publicacionData);
          setImagenes(imagenesData);
          setComentarios(comentariosData);
          setAutorPost(publicacionData.User || null);
        }
      } catch (error) {
        console.error("Error al obtener la publicación:", error);
      } finally {
        //* Sea éxito o error, dejamos de mostrar "Cargando"
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    obtenerPublicacion();

    //* Limpieza: marca la petición como cancelada al salir de la pantalla
    return () => {
      cancelado = true;
    };
  }, [id]);

  //* Muestra las imágenes del post, o un aviso si no hay ninguna
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

  //* Se ejecuta al enviar el formulario de comentarios
  async function crearComentario(e: React.FormEvent<HTMLFormElement>) {
    //* Evita que el formulario recargue la página
    e.preventDefault();
    setErrorComentario(null);

    //* Validación: el campo es obligatorio
    if (!textoComentario.trim()) {
      setErrorComentario("El comentario no puede estar vacío.");
      return;
    }

    //* Sin usuario logueado no se puede comentar
    if (!usuario) {
      setErrorComentario("Debe iniciar sesión para comentar.");
      return;
    }

    setEnviando(true);
    try {
      //* Enviamos el comentario al backend
      const respuesta = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //* El backend espera estos nombres exactos
        body: JSON.stringify({
          content: textoComentario.trim(),
          userId: usuario.id,
          postId: Number(id),
        }),
      });

      //* Si el servidor responde con error, mostramos su mensaje
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);
        throw new Error(datos?.error ?? "Error al crear el comentario");
      }

      //* Agregamos el comentario a la lista. La respuesta del POST no trae
      //* el autor, así que se lo ponemos nosotros (el usuario logueado)
      const comentarioCreado = await respuesta.json();
      setComentarios(prevComentarios => [
        ...prevComentarios,
        { ...comentarioCreado, User: usuario },
      ]);

      //* Limpiamos el campo para escribir otro comentario
      setTextoComentario("");
    } catch (error) {
      console.error("Error al crear el comentario:", error);
      setErrorComentario(
        error instanceof Error ? error.message : "Error al crear el comentario"
      );
    } finally {
      //* Volvemos a habilitar el botón
      setEnviando(false);
    }
  }

  //* Estos chequeos van acá (antes del return), no dentro de crearComentario
  if (cargando) {
    return <p>Cargando publicacion...</p>;
  }

  if (!publicacion) {
    return <p>No se encontró la publicación.</p>;
  }

  return (
    <div>
      <h1>Detalle de Publicación</h1>
      <p>ID de la publicación: {id}</p>

      {/* Imágenes del post */}
      <p>Imágenes:</p>
      <ul>
        {renderImagenes()}
      </ul>

      {/* Datos del post */}
      <p>Descripción: {publicacion?.description}</p>
      <p>Creado por: {autorPost?.nickName ?? publicacion?.User?.nickName}</p>
      <p>Fecha de creación: {publicacion?.createdAt}</p>
      <p>Tags: {publicacion?.Tags?.map((tag) => tag.name).join(", ")}</p>

      {/* Lista de comentarios con el nombre de quien los escribió */}
      <p>Comentarios: </p>
      <ul>
        {comentarios.length > 0 ? (
          comentarios.map((comentario, index) => (
            <li key={comentario.id ?? index}>
              <strong>{comentario.User?.nickName ?? "Anónimo"}</strong>: {comentario.content}
            </li>
          ))
        ) : (
          <li>No hay comentarios disponibles</li>
        )}
      </ul>

      {/* Formulario controlado: solo si hay usuario logueado */}
      {usuario ? (
        <form onSubmit={crearComentario}>
          <div>
            <label htmlFor="comentario">Agregar comentario:</label>
            {/* value + onChange = componente controlado por useState */}
            <input
              type="text"
              id="comentario"
              value={textoComentario}
              onChange={(e) => setTextoComentario(e.target.value)}
            />
          </div>
          {/* Mensaje de error en rojo (vacío, sin sesión o error del servidor) */}
          {errorComentario && <p style={{ color: "red" }}>{errorComentario}</p>}
          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Agregar Comentario"}
          </button>
        </form>
      ) : (
        <p>Iniciá sesión para comentar.</p>
      )}

    </div>
  );
}

export default DetalleDePublicacion;