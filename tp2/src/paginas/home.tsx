import { useEffect, useState } from 'react'
import type { Post } from '../types/Post'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { UsuarioContext } from '../contextos/UsuarioContext';
import CrearNuevaPublicacion from './crearNuevaPublicacion';

function Home() {
  const [publicaciones, setPublicaciones] = useState<Post[]>([])
  
  //Traemos el usuario logeado de inicioDeSesion.tsx
  const usuarioLogeado = useContext(UsuarioContext)
  const navigate = useNavigate()

  //Función para cerrar sesión
  function cerrarSesion() {
    try {
      usuarioLogeado?.setUsuario(null)
      localStorage.removeItem("usuario")
      navigate('/')
    } catch(error){
      console.error("Error al cerrar sesión", error)
    }
  }
  
  //Agregamos un estado al formulario para crear publicación
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  async function obtenerPublicaciones(){
    try{
      const respuesta = await fetch('http://localhost:3001/posts')
      if(!respuesta.ok){
        throw new Error("Error al obtener las publicaciones")
      }

      const datos: Post[] = await respuesta.json()
      setPublicaciones(datos)
      
    } catch(error){
      console.error("Error al obtener las publicaciones:", error)
    }
  }

  //Llamamos al backend cuando se carga Home
  useEffect(() => {
    obtenerPublicaciones()
  }, [])

  return (
    <div className='container mt-4'>
      <nav className="navbar navbar-light bg-light px-3 mb-4">
      <span className="navbar-brand">
        Anti-Social - Inicio
      </span>

        {/* Si hay un usuario logeado, se muestra el botón con su nickname 
        y las opciones para ir al perfil y cerrar sesión */}
        {usuarioLogeado?.usuario ? (
          <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle fw-bold"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
              👤 {usuarioLogeado?.usuario?.nickName}
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/perfil">
                    Perfil
                  </Link>
                </li>

                <li>
                  <button className="dropdown-item" onClick={cerrarSesion}>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
          </div>
          // Si no hay usuario logeado, se muestra el botón de inicio de sesión
        ) : (
          <Link to='/' className='btn btn-primary'>
            Iniciar sesión
          </Link>
        )}
      </nav>

      <h2>Bienvenido {usuarioLogeado?.usuario?.nickName}!</h2>

      {/* Div para crear publicación */}
      <div className="card mt-3 mb-4">
      <div className="card-body">

        <p className="text-muted mb-3">
          ¿Qué estás pensando, {usuarioLogeado?.usuario?.nickName}?
        </p>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {/* Cuando el botón está en "crear publicacion", 
          al hacer click cambia a "cancelar" y viceversa */}
          {mostrarFormulario ? "Cancelar" : "Crear publicación"}
        </button>

        {mostrarFormulario && (
          <div className="mt-4">
            <CrearNuevaPublicacion />
          </div>
        )}

      </div>
    </div>

      <div className="mt-4" style={{ height: '600px', overflowY: 'auto' }}>

        {/* Mapea el array de publicaciones y las convierte en cards */}
        {publicaciones.map((publicacion) => (
          <div className="card mb-4" key={publicacion.id}>

            <div className="card-body">

              <h5 className="card-title"> 👤{publicacion.User?.nickName} </h5>

              <p className="card-text"> {publicacion.description} ... </p>

              {/* Comprueba si la publicación tiene imágenes, si tiene las muestra */}
              {publicacion.Tags && (
                <p className="card-text">
                  <small className="text-body-secondary">
                   🏷️ Tags: {publicacion.Tags.map((tag) => tag.name).join(',')}
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

              <div className="post-footer">
                <span>💬 {publicacion.Comments?.length || 0} comentarios</span>
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default Home;