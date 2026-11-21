import { Routes, Route } from "react-router-dom";
import PantallaInicial from "./paginas/pantallaInicial";
import Home from "./paginas/home";
import DetalleDePublicacion from "./paginas/detalleDePublicacion";
import PerfilDeUsuario from "./paginas/perfilDeUsuario";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Routes>
      {/* Pantalla de bienvenida, login y registro */}
      <Route path="/" element={<PantallaInicial />} />

      {/* Página principal */}
      <Route path="/home" element={<Home />} />
      <Route path="/detalle/:id" element={<DetalleDePublicacion />} />
      <Route path="/perfil" element={<PerfilDeUsuario/>} />
      <Route path="*" element={<NotFound/>}/>
    </Routes>
  );
}

export default App;