import React, { createContext, useContext, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useGridStore } from "../../stores/gridStore";
import { ProjectAlerts } from "@/shared/utils/sweetAlert";

interface AppLayoutProps {
  children: React.ReactNode;
}

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
  const { saveCurrentLayout } = useGridStore();

  const handleNavigation = async (url: string) => {
    if (isEditMode) {
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

      saveCurrentLayout();
      setIsEditMode(false);

      const result = await ProjectAlerts.navigationConfirm();

      if (result.isConfirmed) {
        navigate(url);
      } else {
        setIsEditMode(true);
      }
    } else {
      navigate(url);
    }
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar onNavigate={handleNavigation} />

          <main className="flex-1 flex flex-col overflow-hidden">
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

            <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </EditModeContext.Provider>
  );
}
