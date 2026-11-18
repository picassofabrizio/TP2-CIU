function registroDeUsuario() {
  return (
    <div>
      <h1>Registro de Usuario</h1>
      <form>
        <label htmlFor="nickname">Nombre de usuario:</label>
        <input type="text" id="nickname" name="nickname" required />
        <label htmlFor="nombre">Nombre:</label>
        <input type="text" id="nombre" name="nombre" required />
        <label htmlFor="apellido">Apellido:</label>
        <input type="text" id="apellido" name="apellido" required />
        <label htmlFor="email">Correo electrónico:</label>
        <input type="email" id="email" name="email" required />
        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default registroDeUsuario;