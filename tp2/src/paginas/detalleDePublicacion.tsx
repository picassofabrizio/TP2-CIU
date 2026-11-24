import { Link, useParams } from "react-router-dom";
import type { Post } from "../types/Post";
import type { PostImagen } from "../types/PostImagen";
import type { Comentario } from "../types/Comentario";
import type { Usuario } from "../types/Usuario";
import { useState, useEffect, useContext } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext";

function DetalleDePublicacion() {
  //* Leemos el :id de la URL (/post/:id)
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
      return <p>No hay imágenes disponibles</p>;
    }
    return(
      <ul className="list-unstyled d-flex flex-wrap gap-2 mb-3"> 
        {imagenes.map((imagen) => (
          <li key={imagen.id}>
            <img 
              src={imagen.url} 
              alt={`Imagen ${imagen.id}`}
              className="img-fluid rounded mb-2 d-block w-100" 
              style={{ maxHeight: "450px", objectFit: "cover" }}  
            />
          </li>
        ))}
      </ul>
    )
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
    return <p>Cargando publicación...</p>;
  }

  if (!publicacion) {
    return <p>No se encontró la publicación.</p>;
  }

  return (
    <div className="container mt-4 mb-5" style={{ maxWidth: "700px" }}>
      <nav className="navbar navbar-light bg-white px-3 mb-4 rounded shadow-sm">
        
        {/* El logo es un botón que lleva al home */}
        <Link to="/home" className="navbar-brand fw-bold">
          Anti-Social Net
        </Link>
      
        {/* Si hay un usuario logeado, se muestra el botón con su nickname 
          y las opciones para ir al perfil y cerrar sesión */}
        {usuario ? (
          <Link 
            to={`/perfil/${usuario.id}`}
            className="btn btn-light fw-bold"
          >
            👤 {usuario.nickName}
          </Link>
          // Si no hay usuario logeado, se muestra el botón de inicio de sesión
        ) : (
          <Link to='/' className='btn btn-primary'>
            Iniciar sesión
          </Link>
        )}
      </nav>

      <h1>Detalle de Publicación</h1>
      
      {/* Botón para regresar al Home */}
      <div className="mb-3">
        <Link to="/home" className="btn btn-outline-secondary btn-sm">
          ← Volver al inicio
        </Link>
      </div>

      {/* Estado de carga con el mismo estilo del Home */}
      {cargando ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando publicación...</p>
        </div>
        ) : !publicacion ? (
          <div className="alert alert-warning" role="alert">
            No se encontró la publicación solicitada.
          </div>
        ) : (
          <>
            {/* Tarjeta principal de la publicación */}
            <div className="card mb-4 shadow-sm">
              
              {/* Autor */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title fw-bold mb-0">
                  👤 {autorPost?.nickName ?? publicacion?.User?.nickName}
                </h5>
                <small className="text-muted">
                  Publicado el {publicacion?.createdAt && new Date(publicacion.createdAt).toLocaleDateString("es-AR")}
                </small>
              </div>

              {/* Tags */}
              <p className="card-text fs-5 my-3">{publicacion?.description}</p>
              {publicacion?.Tags && publicacion.Tags.length > 0 && (
                <div className="mb-3">
                  {publicacion.Tags.map((tag) => (
                    <span key={tag.id} className="badge rounded-pill bg-secondary me-1">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Imagenes */}
              {renderImagenes()}

              {/* Comentarios */}
              <div className="border-top pt-3 text-muted">
                <span>💬{comentarios.length} comentarios</span>
              </div>

              {/* Tarjeta de comentarios y formulario */}
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">
                    Comentarios
                  </h5>

                  {comentarios.length > 0 ? (
                    <ul className="list-group list-group-flush mb-4">
                      {comentarios.map((comentario, index) => (
                      <li key={comentario.id ?? index} className="list-group-item px-0 py-3">
                        <div className="fw-bold mb-1">
                          👤 {comentario.User?.nickName ?? "Anónimo"}
                        </div>
                        <div> {comentario.content} </div>
                      </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="alert alert-light border text-muted mb-4">
                      No hay comentarios todavía. ¡Se el primero en comentar!
                    </div>
                  )}

                  {/* Formulario controlado: solo si hay usuario logueado */}
                  {usuario ? (
                    <form onSubmit={crearComentario} className="border-top pt-3">
                      <div className="mb-3">
                        <label htmlFor="comentario" className="form-label fw-bold">
                          Agregar comentario:
                        </label>
                        {/* value + onChange = componente controlado por useState */}
                        <textarea
                          className="form-control"
                          rows={3}
                          id="comentario"
                          placeholder="Escribí lo que pensás sobre esta publicación..."
                          value={textoComentario}
                          onChange={(e) => setTextoComentario(e.target.value)}
                        />
                      </div>
                      {/* Mensaje de error en rojo (vacío, sin sesión o error del servidor) */}
                      {errorComentario && <div className="alert alert-danger py-2">{errorComentario}</div>}
                      <button type="submit" className="btn btn-primary" disabled={enviando}>
                        {enviando ? "Enviando..." : "Agregar Comentario"}
                      </button>
                    </form>
                  ) : (
                    <p>Iniciá sesión para comentar.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      }

      

    </div>
  );
}

export default DetalleDePublicacion;