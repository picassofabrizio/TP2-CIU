import { useState, useEffect, useContext } from "react";
import type { Usuario } from "../types/Usuario";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { UsuarioContext } from "../contextos/UsuarioContext";
import type { Post } from "../types/Post"

function PerfilDeUsuario() {
  const navigate = useNavigate();
  //* Leemos el :id de la URL (/perfil/:id)
  const { id } = useParams<{ id: string }>();
  //* Usuario logueado
  const contexto = useContext(UsuarioContext);
  const usuarioLogueado = contexto?.usuario;
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

        if (!cancelado) {
          setUsuario(usuarioData);
          setPublicaciones(postsData);
        }
      } catch (error) {
        if (!cancelado) {
          setError(error instanceof Error ? error.message : "Error al cargar el perfil.");
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
    //* Si no hay posts, avisamos (antes faltaba el return)
    if (publicaciones.length === 0) {
      return <p>Este usuario aún no tiene publicaciones</p>;
    }
    return publicaciones.map((publicacion) => (
      <article key={publicacion.id}>
        <p>{publicacion.description}</p>
        <small>{new Date(publicacion.createdAt).toLocaleString()}</small>
        <div>
          <Link to={`/detalle/${publicacion.id}`} className="btn btn-primary btn-sm">
            Ver Más
          </Link>
        </div>
        <hr />
      </article>
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
  };


  return (
    <div>
      <h1>Perfil de Usuario</h1>
      <div>
        <p>NickName: {usuario.nickName}</p>
        {usuario.email && <p>Correo: {usuario.email}</p>}
      </div>
      {/* Botón para cerrar sesión */}
      <button className="btn btn-outline-danger btn-sm mb-3" onClick={cerrarSesion}>
        Cerrar sesión
      </button>

      <h2>Publicaciones de {usuario.nickName}</h2>
      {renderPublicaciones()}
    </div>
  );
}

export default PerfilDeUsuario;