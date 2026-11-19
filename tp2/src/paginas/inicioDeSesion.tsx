
import { useState } from "react";
import type { Usuario } from "../types/Usuario";
import { useNavigate } from "react-router-dom";

function InicioDeSesion() {
  //* Controla si el inicio de sesión está procesándose
  const [cargando, setCargando] = useState(false);

  //* Controla si debemos mostrar el mensaje de datos verificados
  const [datosVerificados, setDatosVerificados] = useState(false);

  //* Permite navegar a otra página
  const navigate = useNavigate();

  //* Recuperamos el nickname guardado durante el registro
  const [nickName, setNickName] = useState(() => {
    //* Buscamos los datos del último registro en localStorage
    const datosGuardados = localStorage.getItem("datosRegistro");

    //* Si encontramos datos guardados, los convertimos de texto a objeto
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);

      //* Devolvemos el nickname para completar automáticamente el input
      return datos.nickName;
    }

    //* Si no hay datos guardados, el input comienza vacío
    return "";
  });

  const [password, setPassword] = useState("");

  const API_URL = "http://localhost:3001";

  async function obtenerUsuarios() {
    //* Activamos el indicador de carga
    setCargando(true);

    //* Reiniciamos el mensaje de verificación
    setDatosVerificados(false);

    //* Esperamos un momento para visualizar la carga
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      //* Solicitamos los usuarios al backend
      const respuesta = await fetch(`${API_URL}/users`);

      //* Comprobamos si la petición fue exitosa
      if (!respuesta.ok) {
        console.log("Error al obtener los usuarios");
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
        console.log("El usuario no existe");
        return;
      }

      //* Comprobamos la contraseña ingresada
      if (password !== "123456") {
        console.log("Contraseña incorrecta");
        return;
      }

      //* Indicamos que los datos fueron verificados correctamente
      setDatosVerificados(true);

      //* Esperamos para que el usuario pueda leer el mensaje
      await new Promise((resolve) => setTimeout(resolve, 1000));

      //* Guardamos los datos del usuario que inició sesión
      localStorage.setItem("usuario", JSON.stringify(usuarioEncontrado));

      //* Redirigimos a la página principal
      navigate("/home");
    } catch (error) {
      //* Capturamos errores de conexión con el backend
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
            className="form-control"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            required
          />
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
    </div>
  );
}

export default InicioDeSesion;
