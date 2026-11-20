import { useContext, useState } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext";
import type {Post} from "../types/Post";

function crearNuevaPublicacion() {

  const authContext = useContext(UsuarioContext);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<boolean>(false);

  const postPublicacion = "http://localhost:3001/posts/";

  const postPublicacionImagenes = "http://localhost:3001/postimagenes/";

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
    
    const descripcion = ((formData.get("descripcion") as string) || "").trim();

    const tags = ((formData.get("tags") as string) || "").split(",").map(tag => tag.trim()).filter(Boolean);
    const imagenes = ((formData.get("imagenes") as string) || "").split(",").map(url => url.trim()).filter(Boolean);

    if (!descripcion) {
      setError("La descripción es obligatoria.");
      setEnviado(false);
      return;
    }


    const postData: Post = {
      id: 0, // El ID se asignará automáticamente en el backend
      description: descripcion,
      UserId: Number(usuario.id), // Reemplaza con el ID del usuario actual
      createdAt: new Date().toISOString(),
      Tags: tags.map(tag => ({ id: 0, name: tag })), // Reemplaza con la estructura correcta de Tag
      Imagenes: imagenes.map((url) => ({ id: 0, url, PostId: 0 })) // Reemplaza con la estructura correcta de PostImagen
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
      const imagenData = (postData.Imagenes ?? []).map((img) => ({ ...img, PostId: createdPost.id }));
      for (const img of imagenData) {
        const imgRes = await fetch(postPublicacionImagenes, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(img),
        });
        if(!imgRes.ok) {
          throw new Error("Error al subir la imagen: " + img.url);
        }
      }
      form.reset();
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
    <div>
      <h1>Crear Nueva Publicación</h1>
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="descripcion">Descripción:</label>
          <input type="text" id="descripcion" name="descripcion" required />
        </div>
        <div>
          <label htmlFor="tags">Tags (separados por comas):</label>
          <input type="text" id="tags" name="tags" />
        </div>
        <div>
          <label htmlFor="imagenes">Imágenes (URLs separadas por comas):</label>
          <input type="text" id="imagenes" name="imagenes" />
        </div>
        <button type="submit" disabled={enviado}>
          {enviado ? "Creando..." : "Crear Publicación"}
        </button>
      </form>
    </div>
  );
}

export default crearNuevaPublicacion;