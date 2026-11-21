import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UsuarioContext } from "../contextos/UsuarioContext";

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const contexto = useContext(UsuarioContext);

  // Si no hay usuario logueado, redirigimos a la pantalla de login
  if (!contexto?.usuario) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario, mostramos la página protegida
  return <>{children}</>;
}

export default RutaProtegida;