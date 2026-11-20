import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UsuarioContext } from "../contextos/UsuarioContext.tsx";
import type { Usuario } from "../types/Usuario";

function RegistroDeUsuario() {
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //* Indica si el registro está procesándose
  const [cargando, setCargando] = useState(false);

  //* Controla si debemos mostrar el mensaje de registro exitoso
  const [registroExitoso, setRegistroExitoso] = useState(false);

  //* Guarda los mensajes de error
  const [mensajeError, setMensajeError] = useState("");

  //* Dirección del backend
  const API_URL = "http://localhost:3001";

  //* Permite navegar a otra página desde una función
  const navigate = useNavigate();

  //* Accedemos al contexto del usuario
  const contexto = useContext(UsuarioContext);

  async function registrarUsuario() {
    //* Activamos el indicador de carga
    setCargando(true);

    //* Ocultamos cualquier mensaje anterior
    setRegistroExitoso(false);
    setMensajeError("");

    try {
      //* Comprobamos si la contraseña es la indicada por la consigna
      if (password !== "123456") {
        setMensajeError("La contraseña debe ser 123456");
        return;
      }

      //* Esperamos un momento para que el indicador de carga sea visible
      await new Promise((resolve) => setTimeout(resolve, 1000));

      //* Consultamos los usuarios registrados
      const respuestaUsuarios = await fetch(`${API_URL}/users`);

      //* Comprobamos si pudimos obtener los usuarios
      if (!respuestaUsuarios.ok) {
        throw new Error("No se pudieron obtener los usuarios");
      }

      //* Convertimos la respuesta en un array de usuarios
      const usuarios: Usuario[] = await respuestaUsuarios.json();

      //* Buscamos si el nickname ya está registrado
      const usuarioExistente = usuarios.find(
        (usuario) => usuario.nickName === nickName
      );

      //* Si encontramos el nickname, mostramos un error
      if (usuarioExistente) {
        setMensajeError("Ese nombre de usuario ya existe");
        return;
      }

      //* Enviamos los datos al backend
      const respuesta = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickName,
          email,
        }),
      });

      //* Obtenemos la respuesta del backend
      const datos = await respuesta.json();

      //* Comprobamos si hubo algún error
      if (!respuesta.ok) {
        setMensajeError(
          typeof datos.error === "string"
            ? datos.error
            : "Error al registrar el usuario"
        );
        console.log("Error al registrar el usuario:", datos);
        return;
      }

      //* Guardamos el usuario en el contexto global
      contexto?.setUsuario(datos);

      //* Guardamos los datos del usuario en localStorage
      localStorage.setItem("usuario", JSON.stringify(datos));

      //* Mostramos el mensaje de registro exitoso
      setRegistroExitoso(true);

      //* Esperamos 1,5 segundos antes de ir a Home
      await new Promise((resolve) => setTimeout(resolve, 1500));

      //* Redirigimos a la página principal
      navigate("/home");

      console.log("¡Usuario registrado correctamente!");
    } catch (error) {
      //* Capturamos errores de conexión con el backend
      setMensajeError(
        "No se pudo conectar con el servidor. Intente nuevamente."
      );
      console.log("Error de conexión con el backend:", error);
    } finally {
      //* Detenemos el indicador de carga
      setCargando(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4">Crear cuenta</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          registrarUsuario();
        }}
      >
        <div className="mb-3 text-start">
          <label htmlFor="nickname" className="form-label">
            Nombre de usuario
          </label>

          <input
            type="text"
            id="nickname"
            name="nickname"
            className="form-control"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>

          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {/* Botón de registro */}
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
              Registrando...
            </>
          ) : (
            "Registrarse"
          )}
        </button>

        {/* Mensaje de registro exitoso */}
        {registroExitoso && (
          <div className="alert alert-success mt-3 mb-0">
            ¡Registro exitoso!
          </div>
        )}

        {/* Mensaje de error */}
        {mensajeError && (
          <div className="alert alert-danger mt-3 mb-0">
            {mensajeError}
          </div>
        )}
      </form>
    </div>
  );
}

export default RegistroDeUsuario;