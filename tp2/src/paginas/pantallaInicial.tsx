import { useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import InicioDeSesion from "./inicioDeSesion";
import RegistroDeUsuario from "./registroDeUsuario";
import { TemaContext } from "../contextos/TemaContext";

function PantallaInicial() {
  // Obtenemos el tema actual y la función para cambiarlo.
  const contextoTema = useContext(TemaContext);
  //* Controla qué contenido se muestra en la card
  const [searchParams] = useSearchParams();

  const vistaInicial = searchParams.get("vista") || "inicio";

  const [vista, setVista] = useState(vistaInicial);
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 position-relative">
      {/* Botón para alternar entre modo oscuro y claro */}
      <button
        type="button"
        className="btn btn-outline-primary position-absolute top-0 end-0 m-3"
        onClick={contextoTema?.cambiarTema}
        aria-label={
          contextoTema?.tema === "oscuro"
            ? "Activar modo claro"
            : "Activar modo oscuro"
        }
        title={
          contextoTema?.tema === "oscuro"
            ? "Activar modo claro"
            : "Activar modo oscuro"
        }
      >
        {contextoTema?.tema === "oscuro" ? "☀️" : "🌙"}
      </button>
      <div
        className="card shadow p-4 text-center"
        style={{ width: "100%", maxWidth: "450px" }}
      >
        <h1 className="mb-3">UnaHur Anti-Social Net</h1>

        {/* Botón para volver a la bienvenida */}
        {vista !== "inicio" && (
          <button
            className="btn btn-link text-decoration-none text-start p-0 mb-3"
            onClick={() => setVista("inicio")}
          >
            ← Volver
          </button>
        )}

        {vista === "inicio" && (
          <>
            <p>¡Bienvenido! ¿Qué querés hacer?</p>

            <button
              className="btn btn-primary mb-3"
              onClick={() => setVista("login")}
            >
              Iniciar sesión
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => setVista("registro")}
            >
              Registrarse
            </button>
          </>
        )}
        {/* Muestra el formulario de inicio de sesión */}
        {vista === "login" && <InicioDeSesion />}

        {/* Muestra el formulario de registro */}
        {vista === "registro" && <RegistroDeUsuario />}
      </div>
    </div>
  );
}

export default PantallaInicial;
