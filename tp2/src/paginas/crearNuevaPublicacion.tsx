import { useContext, useEffect, useState } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext";
import type { Tag } from "../types/Tag";
import { Link, useNavigate } from "react-router-dom";

function CrearNuevaPublicacion() {

  const authContext = useContext(UsuarioContext);
  const [error, setError] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState<string>("");
  const [errorDescripcion, setErrorDescripcion] = useState<string | null>(null);
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
    setError(null);
    setEnviado(true);

    const imagenesValidas = imagenes.map((url) => url.trim()).filter((url): url is string => url !== "");
    if (!descripcion.trim()) {
      setErrorDescripcion("La descripción es obligatoria.");
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
    <div className="card mt-3 mb-4 shadow-sm mx-auto" style={{ maxWidth: "700px" }}>
      <div className="card-body">
        <div className="mb-3">
          <Link to="/home" className="btn btn-outline-secondary btn-sm">
            ← Volver al inicio
          </Link>
        </div>
          <h5 className="card-title fw-bold mb-3">
            Crear Nueva Publicación
          </h5>

        {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="descripcion" className="form-label fw-bold">
              Descripción:
            </label>
                        <textarea
              id="descripcion"
              className={`form-control ${errorDescripcion ? "is-invalid" : ""}`}
              rows={3}
              placeholder="¿Qué estás pensando?"
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                setErrorDescripcion(null); 
              }}
              required
            />
            
            <div className="invalid-feedback">{errorDescripcion}</div>
          </div>

          <div className="mb-3">
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
          <div className="mb-3">
            <label className="form-label fw-bold d-block">
             🖼️ Imágenes (opcional):
            </label>
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

          <div className="d-flex justify-content-end border-top pt-3">
            <button type="submit" className="btn btn-primary" disabled={enviado}>
              {enviado ? "Creando..." : "Crear Publicación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearNuevaPublicacion;