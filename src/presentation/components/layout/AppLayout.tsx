import React, { createContext, useContext, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { useGridStore } from "../../stores/gridStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Contexto para manejar el estado del modo edición globalmente
interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(
  undefined
);

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within EditModeProvider");
  }
  return context;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const { saveLayout } = useGridStore();

  const handleNavigation = (url: string) => {
    if (isEditMode) {
      // Si está en modo edición, sincronizar y guardar layout
      const gridElements = document.querySelectorAll(".grid-stack-item");
      const positionUpdates: {
        [id: string]: { x: number; y: number; w: number; h: number };
      } = {};

      gridElements.forEach((element) => {
        const widgetId = element.getAttribute("data-gs-id");
        if (widgetId) {
          const x = parseInt(element.getAttribute("data-gs-x") || "0");
          const y = parseInt(element.getAttribute("data-gs-y") || "0");
          const w = parseInt(element.getAttribute("data-gs-w") || "1");
          const h = parseInt(element.getAttribute("data-gs-h") || "1");
          positionUpdates[widgetId] = { x, y, w, h };
        }
      });

      // Guardar con las posiciones actualizadas
      saveLayout();
      setIsEditMode(false);

      // Mostrar mensaje de confirmación
      const confirmed = window.confirm(
        "Has salido del modo edición y se ha guardado el layout automáticamente. ¿Deseas continuar con la navegación?"
      );

      if (confirmed) {
        navigate(url);
      } else {
        // Si cancela, volver al modo edición
        setIsEditMode(true);
      }
    } else {
      // Navegación normal
      navigate(url);
    }
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar onNavigate={handleNavigation} />

          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header con botón hamburguesa para mobile */}
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
              <SidebarTrigger className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </SidebarTrigger>
              <h1 className="font-semibold">Dashboard Clientes</h1>
              {isEditMode && (
                <div className="ml-auto">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Modo Edición Activo
                  </span>
                </div>
              )}
            </header>

            {/* Contenido principal */}
            <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </EditModeContext.Provider>
  );
}
