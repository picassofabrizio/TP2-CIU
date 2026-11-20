import { useEffect, useState } from 'react'
import type { Post } from '../types/Post'
import { Link } from 'react-router-dom'

function Home() {
  const [publicaciones, setPublicaciones] = useState<Post[]>([])
  
  async function obtenerPublicaciones(){
    try{
      const respuesta = await fetch('http://localhost:3001/posts')
      if(!respuesta.ok){
        throw new Error("Error al obtener los productos")
      }

      const datos: Post[] = await respuesta.json()
      setPublicaciones(datos)
      
    } catch(error){
      console.error("Error al obtener los productos:", error)
    }
  }

  //Llamamos al backend cuando se carga Home
  useEffect(() => {
    obtenerPublicaciones()
  }, [])

  return (
    <div className='container mt-4'>
      <h1>Home</h1>

      <p>Welcome to the home page!</p>
        
      <div className="mt-4" style={{ height: '600px', overflowY: 'auto' }}>

        {/* Mapea el array de publicaciones y las convierte en cards */}
        {publicaciones.map((publicacion) => (
          <div className="card mb-4" key={publicacion.id}>

            <div className="card-body">

              <h5 className="card-title"> {publicacion.User?.nickName} </h5>

              <p className="card-text"> {publicacion.description} </p>

              {/* Comprueba si la publicación tiene imágenes, si tiene las muestra */}
              {publicacion.Tags && (
                <p className="card-text">
                  <small className="text-body-secondary">
                    Tags: {publicacion.Tags.map((tag) => tag.name).join(',')}
                  </small>
                </p>
              )}

              {/* Comprueba si la publicación tiene imágenes, si tiene las muestra */}
              {publicacion.Imagenes && (
                <div>
                  
                  {publicacion.Imagenes?.map((imagen) => (
                    <img
                      key={imagen.id}
                      src={imagen.url}
                      className="img-fluid rounded mb-2"
                      alt="Imagen de la publicación"
                    />
                  ))}
                </div>
              )}

              <Link to={`/detalle/${publicacion.id}`} className='btn btn-primary'>
                Ver más
              </Link>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default Home;