function inicioDeSesion() {
  return (
    <div>
        <h1>Inicio de Sesión</h1>
        <form>
            <label htmlFor="username">Nombre de usuario:</label>
            <input type="text" id="username" name="username" required />
            <label htmlFor="password">Contraseña:</label>
            <input type="password" id="password" name="password" required />
            <button type="submit">Iniciar sesión</button>
        </form>
    </div>
  );
}

export default inicioDeSesion;