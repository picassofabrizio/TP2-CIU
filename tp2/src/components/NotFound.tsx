function NotFound() {
  return (
    <div className="container text-center mt-5">
      <h1>404</h1>
      <h2>Página no encontrada</h2>

      <p className="text-muted">
        La página que estás buscando no existe.
      </p>

      <a href="/" className="btn btn-primary">
        Volver al inicio
      </a>
    </div>
  )
}

export default NotFound