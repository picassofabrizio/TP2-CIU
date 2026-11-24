import { useState, useEffect, useContext } from "react";
import type { Usuario } from "../types/Usuario";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { UsuarioContext } from "../contextos/UsuarioContext";
import { TemaContext } from "../contextos/TemaContext";
import type { Post } from "../types/Post";

function PerfilDeUsuario() {
  const navigate = useNavigate();
  //* Leemos el :id de la URL (/perfil/:id)
  const { id } = useParams<{ id: string }>();
  //* Usuario logueado
  const contexto = useContext(UsuarioContext);
  const usuarioLogueado = contexto?.usuario;
  const contextoTema = useContext(TemaContext);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [publicaciones, setPublicaciones] = useState<Post[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCargando(false);
      setError("ID de usuario no válido.");
      return;
    }

    //* Evita actualizar el estado si el componente se desmontó
    let cancelado = false;
    setCargando(true);
    setError(null);

    const cargarPerfilYPublicaciones = async () => {
      try {
        //* Pedimos el usuario y sus posts en paralelo
        //* Los posts de un usuario se piden con /posts?userId=ID
        const [resUsuario, resPosts] = await Promise.all([
          fetch(`http://localhost:3001/users/${id}`),
          fetch(`http://localhost:3001/posts?userId=${id}`),
        ]);

        if (!resUsuario.ok) {
          throw new Error("No se encontró el usuario.");
        }

        const usuarioData: Usuario = await resUsuario.json();
        const postsData: Post[] = resPosts.ok ? await resPosts.json() : [];

        //* Consultamos los comentarios visibles de cada publicación
        const postsConComentarios = await Promise.all(
          postsData.map(async (post) => {
            try {
              const resComentarios = await fetch(
                `http://localhost:3001/comments/post/${post.id}`,
              );
              const comentarios = resComentarios.ok
                ? await resComentarios.json()
                : [];
              //* Devolvemos el post original agregándole la propiedad Comments
              return { ...post, Comments: comentarios };
            } catch {
              return { ...post, Comments: [] };
            }
          }),
        );

        if (!cancelado) {
          setUsuario(usuarioData);
          setPublicaciones(postsConComentarios);
        }
      } catch (error) {
        if (!cancelado) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar el perfil.",
          );
          setUsuario(null);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarPerfilYPublicaciones();

    return () => {
      cancelado = true;
    };
  }, [id]);

  //* Cierra la sesión: limpia el contexto y el localStorage, y vuelve al login
  function cerrarSesion() {
    contexto?.setUsuario(null);
    localStorage.removeItem("usuario");
    navigate("/");
  }

  //* Lista de publicaciones del usuario
  const renderPublicaciones = () => {
    //* Si no hay posts, avisamos
    if (publicaciones.length === 0) {
      return (
        <div className="alert alert-info">
          Este usuario aún no tiene publicaciones.
        </div>
      );
    }
    return publicaciones.map((publicacion) => (
      <div className="card mb-3 shadow-sm" key={publicacion.id}>
        <div className="card-body">
          <p className="card-text">{publicacion.description}</p>
          <small className="text-muted">
            {new Date(publicacion.createdAt).toLocaleString()}
          </small>

          {/* Cantidad de comentarios visibles y botón al detalle */}
          <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
            <span className="text-muted">
              💬 {publicacion.Comments?.length || 0} comentarios
            </span>
            <Link
              to={`/post/${publicacion.id}`}
              className="btn btn-primary btn-sm"
            >
              Ver más
            </Link>
          </div>
        </div>
      </div>
    ));
  };
  //* Solo se puede ver el perfil propio: si el id de la URL no coincide
  //* con el del usuario logueado, redirigimos a su propio perfil
  if (usuarioLogueado && String(usuarioLogueado.id) !== id) {
    return <Navigate to={`/perfil/${usuarioLogueado.id}`} replace />;
  }

  if (cargando) {
    return <p>Cargando perfil...</p>;
  }

  if (error || !usuario) {
    return <p>{error || "Usuario no encontrado."}</p>;
  }

  return (
    <div className="container mt-4 text-start" style={{ maxWidth: "700px" }}>
      <div className="mb-3 d-flex align-items-center gap-2">
        {/* Botón para volver al Home */}
        <Link to="/home" className="btn btn-outline-secondary btn-sm">
          ← Volver al inicio
        </Link>

        {/* Botón para alternar entre modo oscuro y claro */}
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
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
      </div>
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-1">👤 {usuario.nickName}</h1>
            {usuario.email && (
              <p className="text-muted mb-0">{usuario.email}</p>
            )}
          </div>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <h2 className="h4 mb-3">Publicaciones de {usuario.nickName}</h2>
      {renderPublicaciones()}
    </div>
  );
}

export default PerfilDeUsuario;
