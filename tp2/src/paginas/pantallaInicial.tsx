import { useState } from "react";
import InicioDeSesion from "./inicioDeSesion";
import RegistroDeUsuario from "./registroDeUsuario";

function PantallaInicial() {
  //* Controla qué contenido se muestra en la card
  const [vista, setVista] = useState("inicio");

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
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
              Crear cuenta
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
