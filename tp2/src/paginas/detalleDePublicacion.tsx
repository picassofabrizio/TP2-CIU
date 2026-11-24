import { Link, useParams } from "react-router-dom";
import type { Post } from "../types/Post";
import type { PostImagen } from "../types/PostImagen";
import type { Comentario } from "../types/Comentario";
import type { Usuario } from "../types/Usuario";
import { useState, useEffect, useContext } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext";
import { TemaContext } from "../contextos/TemaContext";

function DetalleDePublicacion() {
  //* Leemos el :id de la URL (/detalle/:id)
  const { id } = useParams<{ id: string }>();

  //* Usuario logueado (para saber quién comenta)
  const contexto = useContext(UsuarioContext);
  const usuario = contexto?.usuario;

  // Obtenemos el tema actual y la función para cambiarlo.
  const contextoTema = useContext(TemaContext);

  //* Datos de la publicación, sus imágenes, comentarios y autor
  const [publicacion, setPublicacion] = useState<Post | null>(null);
  const [imagenes, setImagenes] = useState<PostImagen[]>([]);

  //* Guarda el índice de la imagen que se está mostrando.
  const [indiceImagen, setIndiceImagen] = useState(0);

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [autorPost, setAutorPost] = useState<Usuario | null>(null);

  //* Indica si todavía estamos esperando la respuesta del backend
  const [cargando, setCargando] = useState<boolean>(true);

  //* Estados del formulario de comentarios
  const [textoComentario, setTextoComentario] = useState("");
  const [errorComentario, setErrorComentario] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

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
        const comentariosData = resComentarios.ok
          ? await resComentarios.json()
          : [];
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

  //* Avanza a la siguiente imagen.
  function siguienteImagen() {
    setIndiceImagen((actual) => (actual + 1) % imagenes.length);
  }

  //* Retrocede a la imagen anterior.
  function imagenAnterior() {
    setIndiceImagen(
      (actual) => (actual - 1 + imagenes.length) % imagenes.length,
    );
  }

  //* Muestra el carrusel de imágenes de la publicación.
  function renderImagenes() {
    // Si no hay imágenes, mostramos un aviso.
    if (imagenes.length === 0) {
      return <p>No hay imágenes disponibles</p>;
    }

    // Obtenemos la imagen correspondiente al índice actual.
    const imagenActual = imagenes[indiceImagen];

    return (
      <div className="mb-3 position-relative">
        {/* Mostramos solamente la imagen seleccionada */}
        <img
          src={imagenActual.url}
          alt={`Imagen ${indiceImagen + 1}`}
          className="img-fluid rounded mb-2 d-block w-100"
          style={{ maxHeight: "450px", objectFit: "cover" }}
        />

        {/* Las flechas aparecen solamente si hay más de una imagen */}
        {imagenes.length > 1 && (
          <>
            {/* Flecha para retroceder */}
            <button
              className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle"
              onClick={imagenAnterior}
              aria-label="Imagen anterior"
            >
              ❮
            </button>

            {/* Flecha para avanzar */}
            <button
              className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle"
              onClick={siguienteImagen}
              aria-label="Imagen siguiente"
            >
              ❯
            </button>

            {/* Indicador de la imagen actual */}
            <span className="badge bg-dark position-absolute bottom-0 end-0 m-2">
              {indiceImagen + 1} / {imagenes.length}
            </span>
          </>
        )}
      </div>
    );
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

      //* Agregamos el comentario a la lista con el autor logueado
      const comentarioCreado = await respuesta.json();
      setComentarios((prevComentarios) => [
        ...prevComentarios,
        { ...comentarioCreado, User: usuario },
      ]);

      //* Limpiamos el campo para escribir otro comentario
      setTextoComentario("");
    } catch (error) {
      console.error("Error al crear el comentario:", error);
      setErrorComentario(
        error instanceof Error ? error.message : "Error al crear el comentario",
      );
    } finally {
      //* Volvemos a habilitar el botón
      setEnviando(false);
    }
  }

  //* Estado de carga
  if (cargando) {
    return <p>Cargando publicación...</p>;
  }

  if (!publicacion) {
    return <p>No se encontró la publicación.</p>;
  }

  return (
    <div className="container mt-4 mb-5" style={{ maxWidth: "700px" }}>
      <nav className="navbar navbar-light bg-light px-3 mb-4 rounded shadow-sm">
        {/* El logo es un botón que lleva al home */}
        <Link to="/home" className="navbar-brand fw-bold">
          Anti-Social Net
        </Link>

        {/* Botón para alternar entre modo oscuro y claro */}
        <button
          type="button"
          className="btn btn-outline-primary me-2"
          onClick={contextoTema?.cambiarTema}
          aria-label={
            contextoTema?.tema === "oscuro"
              ? "Activar modo claro"
              : "Activar modo oscuro"
          }
          title={
            contextoTema?.tema === "oscuro"
              ? "Activar modo claro"
              : "Activar modo oscuro"
          }
        >
          {contextoTema?.tema === "oscuro" ? "☀️" : "🌙"}
        </button>

        {/* Acceso al perfil o al inicio de sesión */}
        {usuario ? (
          <Link
            to={`/perfil/${usuario.id}`}
            className="btn btn-outline-primary fw-bold"
          >
            👤 {usuario.nickName}
          </Link>
        ) : (
          <div className="d-flex gap-2">
            <Link to="/?vista=login" className="btn btn-primary">
              Iniciar sesión
            </Link>

            <Link to="/?vista=registro" className="btn btn-outline-primary">
              Registrarse
            </Link>
          </div>
        )}
      </nav>

      <h1>Detalle de Publicación</h1>

      {/* Botón para regresar al Home */}
      <div className="mb-3">
        <Link to="/home" className="btn btn-outline-secondary btn-sm">
          ← Volver al inicio
        </Link>
      </div>

      {/* Tarjeta principal de la publicación */}
      <div className="card mb-4 shadow-sm">
        {/* Autor */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="card-title fw-bold mb-0">
            👤 {autorPost?.nickName ?? publicacion.User?.nickName}
          </h5>
          <small className="text-muted">
            Publicado el {publicacion.createdAt}
          </small>
        </div>

        {/* Descripción */}
        <p className="card-text fs-5 my-3">{publicacion.description}</p>

        {/* Tags */}
        {publicacion.Tags && publicacion.Tags.length > 0 && (
          <div className="mb-3">
            {publicacion.Tags.map((tag) => (
              <span
                key={tag.id}
                className="badge rounded-pill bg-secondary me-1"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Imágenes */}
        {renderImagenes()}

        {/* Comentarios */}
        <div className="border-top pt-3 text-muted">
          <span>💬 {comentarios.length} comentarios</span>
        </div>

        {/* Tarjeta de comentarios y formulario */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Comentarios</h5>

            {comentarios.length > 0 ? (
              <ul className="list-group list-group-flush mb-4">
                {comentarios.map((comentario, index) => (
                  <li
                    key={comentario.id ?? index}
                    className="list-group-item px-0 py-3"
                  >
                    <div className="fw-bold mb-1">
                      👤 {comentario.User?.nickName ?? "Anónimo"}
                    </div>
                    <div>{comentario.content}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="alert alert-light border text-muted mb-4">
                No hay comentarios todavía. ¡Sé el primero en comentar!
              </div>
            )}

            {/* Formulario controlado: solo si hay usuario logueado */}
            {usuario ? (
              <form onSubmit={crearComentario} className="border-top pt-3">
                <div className="mb-3">
                  <label htmlFor="comentario" className="form-label fw-bold">
                    Agregar comentario:
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    id="comentario"
                    placeholder="Escribí lo que pensás sobre esta publicación..."
                    value={textoComentario}
                    onChange={(e) => setTextoComentario(e.target.value)}
                  />
                </div>

                {/* Mensaje de error */}
                {errorComentario && (
                  <div className="alert alert-danger py-2">
                    {errorComentario}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={enviando}
                >
                  {enviando ? "Enviando..." : "Agregar Comentario"}
                </button>
              </form>
            ) : (
              <div className="alert alert-warning mt-3" role="alert">
                {/* Aviso para usuarios sin sesión */}
                <h6 className="fw-bold mb-2 text-dark">
                  ¡Querés participar de la conversación?
                </h6>

                <p className="mb-3">
                  Para comentar esta publicación necesitás iniciar sesión o
                  crear una cuenta.
                </p>

                <div className="d-flex gap-2 flex-wrap">
                  <Link to="/?vista=login" className="btn btn-primary btn-sm">
                    Iniciar sesión
                  </Link>

                  <Link
                    to="/?vista=registro"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Registrarme
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleDePublicacion;
