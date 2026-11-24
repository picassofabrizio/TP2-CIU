
import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Definimos los dos temas disponibles.
type Tema = "claro" | "oscuro";

// Indicamos qué información compartirá el contexto.
interface TemaContextType {
  tema: Tema;
  cambiarTema: () => void;
}

// Creamos el contexto.
export const TemaContext = createContext<TemaContextType | null>(null);

// Componente que administra el tema de toda la aplicación.
export function TemaProvider({ children }: { children: ReactNode }) {

  // Recuperamos el tema guardado o iniciamos en modo oscuro.
  const [tema, setTema] = useState<Tema>(() => {
    const temaGuardado = localStorage.getItem("tema");

    return temaGuardado === "claro" ? "claro" : "oscuro";
  });

  // Cambia entre modo claro y oscuro.
  function cambiarTema() {
    setTema((temaActual) =>
      temaActual === "oscuro" ? "claro" : "oscuro"
    );
  }

  // Aplicamos el tema y guardamos la preferencia.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  return (
    <TemaContext.Provider value={{ tema, cambiarTema }}>
      {children}
    </TemaContext.Provider>
  );
}
