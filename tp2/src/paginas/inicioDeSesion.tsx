import { useState } from "react";
import type { Usuario } from "../types/Usuario";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext.tsx";

function InicioDeSesion() {
  //* Controla si el inicio de sesión está procesándose
  const [cargando, setCargando] = useState(false);

  //* Controla si debemos mostrar el mensaje de datos verificados
  const [datosVerificados, setDatosVerificados] = useState(false);

  //* Permite navegar a otra página
  const navigate = useNavigate();

  //* Guarda el nickname ingresado por el usuario
  const [nickName, setNickName] = useState("");

  const [password, setPassword] = useState("");

  //* Error de validación del nombre de usuario
  const [errorNickName, setErrorNickName] = useState<string | null>(null);

  const API_URL = "http://localhost:3001";

  //* Accedemos al contexto del usuario
  const contexto = useContext(UsuarioContext);

  const [mensajeError, setMensajeError] = useState("");

  async function obtenerUsuarios() {
  //* Si el nombre de usuario está vacío, no enviamos nada al backend
  if (!nickName.trim()) {
    setErrorNickName("El nombre de usuario es obligatorio.");
    return;
  }

    //* Activamos el indicador de carga
    setCargando(true);

    //* Reiniciamos el mensaje de verificación
    setDatosVerificados(false);

    setMensajeError("");

    try {
      //* Esperamos un momento para visualizar la carga
      await new Promise((resolve) => setTimeout(resolve, 1000));

      //* Solicitamos los usuarios al backend
      const respuesta = await fetch(`${API_URL}/users`);

      //* Comprobamos si la petición fue exitosa
      if (!respuesta.ok) {
        setMensajeError("Error al obtener los usuarios");
        return;
      }

      //* Convertimos la respuesta en un array de usuarios
      const usuarios: Usuario[] = await respuesta.json();

      //* Buscamos al usuario que coincide con el nickname ingresado
      const usuarioEncontrado = usuarios.find(
        (usuario) => usuario.nickName === nickName,
      );

      //* Comprobamos si el usuario existe
      if (!usuarioEncontrado) {
        setMensajeError("El usuario no existe");
        return;
      }

      //* Comprobamos la contraseña ingresada
      if (password !== "123456") {
        setMensajeError("Contraseña incorrecta");
        return;
      }

      //* Indicamos que los datos fueron verificados correctamente
      setDatosVerificados(true);

      //* Guardamos el usuario en el contexto global
      contexto?.setUsuario(usuarioEncontrado);

      //* Esperamos para que el usuario pueda leer el mensaje
      await new Promise((resolve) => setTimeout(resolve, 1000));

      //* Guardamos los datos del usuario que inició sesión
      localStorage.setItem("usuario", JSON.stringify(usuarioEncontrado));

      //* Redirigimos a la página principal
      navigate("/home");
    } catch (error) {
      // Capturamos errores de conexión con el backend
      setMensajeError(
        "No se pudo conectar con el servidor. Intente nuevamente.",
      );
      console.log("Error de conexión con el backend:", error);
    } finally {
      //* Detenemos el indicador de carga
      setCargando(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4">Iniciar sesión</h2>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          obtenerUsuarios();
        }}
      >
      <div className="mb-3 text-start">
        <label htmlFor="username" className="form-label">
          Nombre de usuario
        </label>
                <input
          type="text"
          id="username"
          name="username"
          className={`form-control ${errorNickName ? "is-invalid" : ""}`}
          value={nickName}
          onChange={(e) => {
            setNickName(e.target.value);
            setErrorNickName(null); // al escribir, se borra el error
          }}
          required
        />
        <div className="invalid-feedback">{errorNickName}</div>
        </div>

        <div className="mb-4 text-start">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>

          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Botón de inicio de sesión */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={cargando}
        >
          {cargando ? (
            <>
              {/* Indicador de carga */}
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              Ingresando...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      {/* Mensaje de verificación exitosa */}
      {datosVerificados && (
        <div className="alert alert-success mt-3 mb-0">
          ¡Datos verificados correctamente!
        </div>
      )}

      {mensajeError && (
        <div className="alert alert-danger mt-3">{mensajeError}</div>
      )}
    </div>
  );
}

export default InicioDeSesion;
