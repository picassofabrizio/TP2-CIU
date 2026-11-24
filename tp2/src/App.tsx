import { Routes, Route } from "react-router-dom";
import PantallaInicial from "./paginas/pantallaInicial";
import Home from "./paginas/home";
import DetalleDePublicacion from "./paginas/detalleDePublicacion";
import PerfilDeUsuario from "./paginas/perfilDeUsuario";
import CrearNuevaPublicacion from "./paginas/crearNuevaPublicacion";
import NotFound from "./components/NotFound";
import RutaProtegida from "./components/RutaProtegida";
import { TemaProvider } from "./contextos/TemaContext";

function App() {
  return (
    // El proveedor permite que todas las páginas accedan al tema.
    <TemaProvider>
      <Routes>
        {/* Pantalla de bienvenida, login y registro */}
        <Route path="/" element={<PantallaInicial />} />

        {/* Página principal */}
        <Route path="/home" element={<Home />} />

        {/* Detalle de publicación */}
        <Route path="/post/:id" element={<DetalleDePublicacion />} />

        {/* Rutas protegidas */}
        <Route
          path="/perfil/:id"
          element={
            <RutaProtegida>
              <PerfilDeUsuario />
            </RutaProtegida>
          }
        />

        <Route
          path="/crear-publicacion"
          element={
            <RutaProtegida>
              <CrearNuevaPublicacion />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TemaProvider>
  );
}

export default App;