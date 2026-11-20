
import { createContext, useState } from "react";
import type { Usuario } from "../types/Usuario";

//* Definimos qué información compartirá nuestro contexto
interface UsuarioContextType {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
}

//* Creamos el contexto que compartirá los datos del usuario
export const UsuarioContext = createContext<UsuarioContextType | null>(null);

//* Creamos el componente que compartirá el usuario con la aplicación
export function UsuarioProvider({ children }: { children: React.ReactNode }) {

  //* Recuperamos los datos del usuario guardados en localStorage
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  return (
    <UsuarioContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UsuarioContext.Provider>
  );
}
