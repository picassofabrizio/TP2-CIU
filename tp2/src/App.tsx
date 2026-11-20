import { Routes, Route } from "react-router-dom";
import PantallaInicial from "./paginas/pantallaInicial";
import Home from "./paginas/home";
import DetalleDePublicacion from "./paginas/detalleDePublicacion";
import PerfilDeUsuario from "./paginas/perfilDeUsuario";

function App() {
  return (
    <Routes>
      {/* Pantalla de bienvenida, login y registro */}
      <Route path="/" element={<PantallaInicial />} />

      {/* Página principal */}
      <Route path="/home" element={<Home />} />
      <Route path="/detalle/:id" element={<DetalleDePublicacion />} />
      <Route path="/perfil" element={<PerfilDeUsuario/>} />
    </Routes>
  );
}

export default App;