import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { UsuarioProvider } from "./contextos/UsuarioContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UsuarioProvider>
      <App />
    </UsuarioProvider>
  </BrowserRouter>,
);
