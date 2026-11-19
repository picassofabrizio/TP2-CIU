import { Routes, Route } from "react-router-dom";
import PantallaInicial from "./paginas/pantallaInicial";
import Home from "./paginas/home";
import DetalleDePublicacion from "./paginas/detalleDePublicacion";


function App() {
  return (
    <Routes>
      {/* Pantalla de bienvenida, login y registro */}
      <Route path="/" element={<PantallaInicial />} />

      {/* Página principal */}
      <Route path="/home" element={<Home />} />
      <Route path="/detalle/:id" element={<DetalleDePublicacion />} />
    </Routes>
  );
}

export default App;