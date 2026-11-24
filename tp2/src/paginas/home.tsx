import { useEffect, useState, useContext } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Post } from '../types/Post'
import { UsuarioContext } from '../contextos/UsuarioContext';

function Home() {
  
  //Traemos el usuario logeado de inicioDeSesion.tsx
  const usuarioLogeado = useContext(UsuarioContext)
  const navigate = useNavigate()

  //Estados para datos, carga y errores
  const [publicaciones, setPublicaciones] = useState<Post[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const filtroTag = searchParams.get('tag') ?? ''

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

  async function obtenerPublicaciones(){
    setCargando(true)
    setError(null)
    try{
      const respuesta = await fetch('http://localhost:3001/posts')
      if(!respuesta.ok){
        throw new Error(`Error del servidor: ${respuesta.status}`)
      }

      const datos: Post[] = await respuesta.json()
      
      //Consultamos los comentarios visibles de cada publicación al endpoint
          const publicacionesConComentarios = await Promise.all(
        datos.map(async (publicacion) => {
          try{
            const resComentarios = await fetch(`http://localhost:3001/comments/post/${publicacion.id}`)
            const comentarios = resComentarios.ok ? await resComentarios.json() : []

            //Consultamos también las imágenes de cada publicación (GET /posts no las trae)
            const resImagenes = await fetch(`http://localhost:3001/postimages/post/${publicacion.id}`)
            const imagenes = resImagenes.ok ? await resImagenes.json() : []

            return { ...publicacion, Comments: comentarios, Imagenes: imagenes }
          } catch{
            return { ...publicacion, Comments: [], Imagenes: [] }
          }
        })
      )

      // Ordenamos de la más nueva a la más vieja
      publicacionesConComentarios.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // Guardamos en el estado las publicaciones completas
      setPublicaciones(publicacionesConComentarios)  
    } catch(error){
      console.error("Error al obtener las publicaciones:", error)
      setError('No se pudieron cargar las publicaciones.')
    } finally{
      setCargando(false)
    }
  }

  //Llamamos al backend cuando se carga Home
  useEffect(() => {
    obtenerPublicaciones()
  }, [])

  const publicacionesFiltradas = publicaciones.filter((publicacion) => {
    //Si no hay ningun filtro, retorna todas
    if(!filtroTag) return true
    return publicacion.Tags?.some(
      (tag) => tag.name.toLowerCase().includes(filtroTag.toLowerCase())
    )
  })

  return (
      <div className='container mt-4' style={{ maxWidth: '700px' }}>

      {/* Barra de navegación */}
      <nav className="navbar navbar-light bg-white px-3 mb-4 rounded shadow-sm sticky-top">
      <span className="navbar-brand fw-bold">
        Anti-Social Net
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
              👤 {usuarioLogeado.usuario.nickName}
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item"
                  to={`/perfil/${usuarioLogeado.usuario.id}`}>  
                    Mi perfil
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

      {/* Banner de bienvenida. Si hay usuario logeado, lo saluda por su nombre. Si no, visitante */}
      <div className='p-4 mb-4 bg-white rounded-3 border'>
        <h2 className='fw-bold'>
          ¡Bienvenido, {usuarioLogeado?.usuario? usuarioLogeado.usuario.nickName: 'visitante'}!
        </h2>
        <p className='text-muted mb-0'>
          Bienvenido a la red (anti)social de la UNAHUR. 
          Compartí ideas y debatí con la comunidad.
        </p>
      </div>

      {/* Div para crear publicación */}
      <div className="card mt-3 mb-4">
        <div className="card-body">

          <p className="text-muted mb-3">
            ¿Qué estás pensando {usuarioLogeado?.usuario?.nickName}?
          </p>

        <Link to="/crear-publicacion" className="btn btn-outline-primary">
          Crear nueva publicación
        </Link>
        </div>
      </div>

      <div className="input-group mb-4">
        <span className='input-group-text'>
          🏷️
        </span>

        {/* Filtra las publicaciones con la etiqueta indicada en el input */}
        <input type="text" className="form-control" 
          placeholder="Buscar publicaciones por tag. Ej: arte, unahur..." 
          value={filtroTag}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
             const valor = e.target.value
             if (valor.trim() === ""){
              setSearchParams({})
             } else{
              setSearchParams({ tag: valor })
             }
          }}
        />
      </div>
        
        {/* Estilos para el estado de carga */}
        {cargando ? (
        <div className='text-center my-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>
              Cargando...
            </span>
          </div>
          <p className="mt-2 text-muted">
            Cargando publicaciones...  
          </p> 
        </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : publicacionesFiltradas.length === 0 ? (
          <div className='alert alert-info'>
            {filtroTag 
            ? `No se encontraron publicaciones con la etiqueta indicada.`
            : 'Todavía no hay publicaciones. ¡Sé el primero en compartir algo!'
            }
          </div>
        ):(
          <div className='feed-container'>
            {publicacionesFiltradas.map((publicacion) => (
              <div className="card mb-4 shadow-sm" key={publicacion.id}>

                <div className="card-body">

                  <h5 className="card-title fw-bold"> 
                    👤{publicacion.User?.nickName}
                  </h5>

                  <p className="card-text">
                    {publicacion.description} ... 
                  </p>

                  {/* Comprueba si la publicación tiene etiquetas, si tiene las muestra */}
                  {publicacion.Tags && (
                    <div className="mb-3">
                      {publicacion.Tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="badge rounded-pill bg-secondary me-1"
                          style={{cursor: "pointer"}}
                          onClick={() => setSearchParams({ tag: tag.name })}
                        >
                          #{tag.name}
                        </span>
                      ))}
                      {/* <small className="text-body-secondary">
                      🏷️ Tags: {publicacion.Tags.map((tag) => tag.name).join(',')}
                      </small> */}
                    </div>
                  )}

                  {/* Comprueba si la publicación tiene imágenes, si tiene las muestra */}
                  {publicacion.Imagenes && (
                    <div className="mb-3">
                      {publicacion.Imagenes.map((imagen) => (
                        <img
                          key={imagen.id}
                          src={imagen.url}
                          className="img-fluid rounded mb-2 w-100"
                          alt="Imagen de la publicación"
                          style={{ maxHeight: '400px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <span className="text-muted">
                      💬 {publicacion.Comments?.length || 0} comentarios
                    </span>
                    <Link to={`/post/${publicacion.id}`} className='btn btn-primary btn-sm'>
                      Ver más
                    </Link>
                  </div>

                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home;