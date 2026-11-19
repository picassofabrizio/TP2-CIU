import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegistroDeUsuario() {
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //* Indica si el registro está procesándose
  const [cargando, setCargando] = useState(false);

  //* Controla si debemos mostrar el mensaje de registro exitoso
  const [registroExitoso, setRegistroExitoso] = useState(false);

  //* Dirección del backend
  const API_URL = "http://localhost:3001";

  //* Permite navegar a otra página desde una función
  const navigate = useNavigate();

  async function registrarUsuario() {
    //* Activamos el indicador de carga
    setCargando(true);

    //* Ocultamos cualquier mensaje de éxito anterior
    setRegistroExitoso(false);

    //* Comprobamos que la contraseña sea la indicada por la consigna
    if (password !== "123456") {
      console.log("La contraseña debe ser 123456");
      return;
    }

    try {
      //* Esperamos un momento para que el indicador de carga sea visible
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
        console.log("Error al registrar el usuario:", datos);
        return;
      }

      //* Mostramos el mensaje de registro exitoso
      setRegistroExitoso(true);

      //* Esperamos 1,5 segundos antes de ir a Home
      setTimeout(() => {
        navigate("/home");
      }, 1500);

      console.log("¡Usuario registrado correctamente!");
    } catch (error) {
      //* Capturamos errores de conexión con el backend
      console.log("Error de conexión:", error);
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

        {/* Mensaje que aparece cuando el registro es exitoso */}
        {registroExitoso && (
          <div className="alert alert-success mt-3 mb-0">
            ¡Registro exitoso!
          </div>
        )}
      </form>
    </div>
  );
}

export default RegistroDeUsuario;
