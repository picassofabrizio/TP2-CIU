import { useContext, useEffect, useState } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext";
import type { Tag } from "../types/Tag";

function CrearNuevaPublicacion() {

  const authContext = useContext(UsuarioContext);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState<string>("");
  const [etiquetas, setEtiquetas] = useState<Tag[]>([]);
  const [tagsSeleccionados, setTagSeleccionados] = useState<number[]>([]);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje(null);
    setError(null);
    setEnviado(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const imagenes = ((formData.get("imagenes") as string) || "").split(",").map(url => url.trim()).filter(Boolean);

    if (!descripcion.trim()) {
      setError("La descripción es obligatoria.");
      setEnviado(false);
      return;
    }


    const postData = {
      description: descripcion.trim(),
      userId: usuario.id,
      tagIds: [] as number [],
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
      for (const url of imagenes) {
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
      form.reset();
      setDescripcion("");
      setMensaje("Publicación creada exitosamente.");
    } catch (error) {
      console.error("Error al crear la publicación:", error);
      setError(error instanceof Error ? error.message : "Error al crear la publicación");
    }
    finally {
      setEnviado(false);
    }
  };

  return (
    <div className="card mt-3 mb-4" shadow-sm>
      <div className="card-body">
        <h5 className="card-title fw-bold mb-3">Crear Nueva Publicación</h5>
        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="descripcion" className="form-label fw-bold">
              Descripción:
            </label>
            <textarea id="descripcion" 
              className="form-control" 
              rows={3} 
              placeholder="¿Qué querés compartir?" 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="tags" className="form-label fw-bold">
              Tags (separados por comas):
            </label>
            <div className="input-group">
              <span className="input-group-text">
                🏷️
              </span>
              <input 
                type="text" 
                id="tags" 
                name="tags" 
                className="form-control" 
                placeholder="Ingresá tus tags separados por comas" 
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="imagenes" className="form-label fw-bold">
              Imágenes (URLs separadas por comas):
            </label>
          </div>
          <div className="input-group">
            <span className="input-group-text">
              🖼️
            </span>
            <input 
              type="text" 
              id="imagenes" 
              name="imagenes" 
              className="form-control"
              placeholder="Ingresá las URLs de las imágenes separadas por comas" 
            />
          </div>

          <div className="d-flex justify-content-end">
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