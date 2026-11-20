import type {Post} from "../types/Post";

function crearNuevaPublicacion() {

  const postPublicacion = "http://localhost:3001/POST/posts/";

  const postPublicacionImagenes = "http://localhost:3001/POST/postimagenes/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const descripcion = formData.get("descripcion") as string;
    const tags = (formData.get("tags") as string).split(",").map(tag => tag.trim());
    const imagenes = (formData.get("imagenes") as string).split(",").map(url => url.trim());

    const postData: Post = {
      id: 0, // El ID se asignará automáticamente en el backend
      description: descripcion,
      UserId: 1, // Reemplaza con el ID del usuario actual
      createdAt: new Date().toISOString(),
      Tags: tags.map(tag => ({ id: 0, name: tag })), // Reemplaza con la estructura correcta de Tag
      Imagenes: imagenes.map(url => ({ id: 0, url, PostId: 0 })) // Reemplaza con la estructura correcta de PostImagen
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
        await fetch(postPublicacionImagenes, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(img)
        });
      }

    } catch (error) {
      console.error("Error al crear la publicación:", error);
    }
  };

  return (
    <div>
      <h1>Crear Nueva Publicación</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="descripcion">Descripción:</label>
          <input type="text" id="descripcion" name="descripcion" required />
        </div>
        <div>
          <label htmlFor="tags">Tags (separados por comas):</label>
          <input type="text" id="tags" name="tags" placeholder="Ingresá tus tags separados por comas" />
        </div>
        <div>
          <label htmlFor="imagenes">Imágenes (URLs separadas por comas):</label>
          <input type="text" id="imagenes" name="imagenes" placeholder="Ingresá las URLs de las imágenes separadas por comas" />
        </div>
        <button type="submit">Crear Publicación</button>
      </form>
    </div>
  );
}

export default crearNuevaPublicacion;