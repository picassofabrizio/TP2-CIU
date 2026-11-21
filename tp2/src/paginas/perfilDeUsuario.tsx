import { useState, useEffect } from "react";
import type { Usuario } from "../types/Usuario";
import { useParams } from "react-router-dom";
import type { Post } from "../types/Post"

function PerfilDeUsuario() {
  //* Leemos el :id de la URL (/perfil/:id)
  const { id } = useParams<{ id: string }>();
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
        <hr />
      </article>
    ));
  };

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

      <h2>Publicaciones de {usuario.nickName}</h2>
      {renderPublicaciones()}
    </div>
  );
}

export default PerfilDeUsuario;