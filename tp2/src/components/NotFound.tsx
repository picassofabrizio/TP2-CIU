import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container text-center mt-5">
      <h1 className="text-danger display-1 fw-bold">404</h1>
      <h2>Página no encontrada</h2>

      <p className="text-muted">
        La página que estás buscando no existe.
      </p>

      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}

export default NotFound