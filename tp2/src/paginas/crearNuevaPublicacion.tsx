import { useContext, useEffect, useState } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext";
import type { Tag } from "../types/Tag";
import { useNavigate } from "react-router-dom";

function CrearNuevaPublicacion() {

  const authContext = useContext(UsuarioContext);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState<string>("");
  const [etiquetas, setEtiquetas] = useState<Tag[]>([]);
  const [tagsSeleccionados, setTagSeleccionados] = useState<number[]>([]);
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState<string[]>([""]);
  const [enviado, setEnviado] = useState<boolean>(false);

  useEffect(() => {
    const obtenerEtiquetas = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/tags");
        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las etiquetas");
        }
        const datos: Tag[] = await respuesta.json();
        setEtiquetas(datos);
      } catch(error){
        console.error("Error al obtener las etiquetas:", error);
        setError("No se pudieron cargar las etiquetas.");
      }
    };

    obtenerEtiquetas();
  }, []);

  const postPublicacion = "http://localhost:3001/posts/";

  const postPublicacionImagenes = "http://localhost:3001/postimages/";

  if (!authContext || !authContext.usuario) {
    return <p>Debe iniciar sesión para crear una publicación.</p>;
  }

  const {usuario} = authContext;

  function cambiarImagen(posicion: number, nuevaUrl: string) {
    const nuevas= [...imagenes];
    nuevas[posicion] = nuevaUrl;
    setImagenes(nuevas);
  }

  function agregarImagen() {
    setImagenes([...imagenes, ""]);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje(null);
    setError(null);
    setEnviado(true);

    const imagenesValidas = imagenes.map((url) => url.trim()).filter((url): url is string => url !== "");
    if (!descripcion.trim()) {
      setError("La descripción es obligatoria.");
      setEnviado(false);
      return;
    }


    const postData = {
      description: descripcion.trim(),
      userId: usuario.id,
      tagIds: tagsSeleccionados,
    };

    try {
      // Enviar la publicación al backend
      const response = await fetch(postPublicacion, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });
      if (!response.ok) {
        throw new Error("Error al crear la publicación");
      }
      const createdPost = await response.json();

      // Enviar las imágenes al backend
      for (const url of imagenesValidas) {
        const imgRes = await fetch(postPublicacionImagenes, {
          method : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // El backend espera url y postId
          body: JSON.stringify({ url, postId: createdPost.id }),
        });
        if (!imgRes.ok) {
          throw new Error("Error al subir la imagen: " + url);
        }
      }
      navigate(`/perfil/${usuario.id}`);
    } catch (error) {
      console.error("Error al crear la publicación:", error);
      setError(error instanceof Error ? error.message : "Error al crear la publicación");
    }
    finally {
      setEnviado(false);
    }
  };

  return (
    <div>
      <h1>Crear Nueva Publicación</h1>
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="descripcion">Descripción:</label>
          <input type="text" id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        </div>
        <div>
          <p>Etiquetas:</p>
          {etiquetas.map((tag) => (
            <div className="form-check form-check-inline" key={tag.id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`tag-${tag.id}`}
                checked={tagsSeleccionados.includes(tag.id)}
                onChange={() =>
                  setTagSeleccionados((prev) =>
                    prev.includes(tag.id)
                      ? prev.filter((id) => id !== tag.id) // si ya estaba, la saco
                      : [...prev, tag.id] // si no estaba, la agrego
                  )
                }
              />
              <label className="form-check-label" htmlFor={`tag-${tag.id}`}>
                #{tag.name}
              </label>
            </div>
          ))}
        </div>
                <div>
          <p>Imágenes (opcional):</p>
          {imagenes.map((url, posicion) => (
            <input
              key={posicion}
              type="url"
              className="form-control mb-2"
              placeholder="https://..."
              value={url}
              onChange={(e) => cambiarImagen(posicion, e.target.value)}
            />
          ))}
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={agregarImagen}>
            + Agregar otra imagen
          </button>
        </div>
        <button type="submit" disabled={enviado}>
          {enviado ? "Creando..." : "Crear Publicación"}
        </button>
      </form>
    </div>
  );
}

export default CrearNuevaPublicacion;