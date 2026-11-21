import { useState, useEffect } from "react";
import type { Usuario } from "../types/Usuario";
import { useParams } from "react-router-dom";
import type { Post } from "../types/Post"

function PerfilDeUsuario() {
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

    let cancelado = false;
    setCargando(true);
    setError(null);

    const cargarPerfilYPublicaciones = async () => {
      try {
        const [resUsuario, resPosts] = await Promise.all([
          fetch(`http://localhost:3001/users/${id}`),
          fetch(`http://localhost:3001/users/${id}/posts`),
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

  const renderPublicacionesConImagenes = () => {
    if (publicaciones.length === 0){
      <p>Este usuario aun no tiene publicaciones</p>
    }
    return publicaciones.map((publicacion) => {
      const imagenesDePublicacion = publicacion.Imagenes || [];
      return (
        <article key={publicacion.id}>
          <p>{publicacion.description}</p>
          {imagenesDePublicacion.length > 0 && (
            <div>
              <h4>Imágenes:</h4>
              {imagenesDePublicacion.map((imagen) => (
                <img
                  key={imagen.id}
                  src={imagen.url}
                  alt={`Imagen ${imagen.id} de la publicación`}
                />
              ))}
            </div>
          )}
        </article>
      );
    });
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
      {renderPublicacionesConImagenes()}
    </div> 
  );
}

export default PerfilDeUsuario;