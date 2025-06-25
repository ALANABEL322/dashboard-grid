import { Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header con botón hamburguesa para mobile */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
            <SidebarTrigger className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SidebarTrigger>
            <h1 className="font-semibold">Dashboard Grid</h1>
          </header>

          {/* Contenido principal */}
          <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
