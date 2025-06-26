import React, { useEffect } from "react";
import { Users, Edit3, Eye, Save, RefreshCw, Trash } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { GridWidget } from "../components/grid/GridWidget";
import { useGridstack } from "../hooks/useGridstack";
import { useEditMode } from "../components/layout/AppLayout";
import { type GridWidgetData } from "../stores/gridStore";
import { ProjectAlerts } from "@/shared/utils/sweetAlert";

import "gridstack/dist/gridstack.min.css";

export const GridPage = () => {
  const { isEditMode, setIsEditMode } = useEditMode();
  const {
    gridRef,
    widgets,
    toggleWidgetVisibility,
    removeWidget,
    restoreAllWidgets,
    isDragging,
    syncPositionsFromDOM,
    saveCurrentLayout,
  } = useGridstack(isEditMode, setIsEditMode);

  useEffect(() => {
    console.log("[GRIDPAGE] Component mounted, checking initial state...");
    const currentWidgets = widgets.map((w) => ({
      id: w.id,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
      visible: w.visible,
    }));
    console.log("[GRIDPAGE] Current widgets from store:", currentWidgets);

    currentWidgets.forEach((w) => {
      console.log(
        `[GRIDPAGE] ${w.id}: (${w.x},${w.y},${w.w},${w.h},${w.visible})`
      );
    });

    const stored = localStorage.getItem("grid-storage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const storedWidgets = parsed.state?.widgets?.map((w: any) => ({
          id: w.id,
          x: w.x,
          y: w.y,
          w: w.w,
          h: w.h,
          visible: w.visible,
        }));
        console.log("[GRIDPAGE] Data in localStorage:", storedWidgets);

        storedWidgets?.forEach((w: any) => {
          console.log(
            `[GRIDPAGE] localStorage ${w.id}: (${w.x},${w.y},${w.w},${w.h},${w.visible})`
          );
        });
      } catch (error) {
        console.log("[GRIDPAGE] Error reading localStorage:", error);
      }
    } else {
      console.log("[GRIDPAGE] No data found in localStorage");
    }
  }, []);

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveLayout = () => {
    console.log("[UI] Manual save button clicked");
    console.log(
      "[UI] Current widget positions before save:",
      widgets.map((w) => ({
        id: w.id,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
        visible: w.visible,
      }))
    );

    saveCurrentLayout();
    setIsEditMode(false);

    ProjectAlerts.layoutSaved();
  };

  const handleClearStorage = async () => {
    const result = await ProjectAlerts.clearStorageConfirm();

    if (result.isConfirmed) {
      localStorage.removeItem("grid-storage");
      restoreAllWidgets();

      await ProjectAlerts.storageCleared();
      window.location.reload();
    }
  };

  const visibleWidgetsCount = widgets.filter((w) => w.visible).length;
  const totalWidgetsCount = widgets.length;

  return (
    <div className="p-6 h-full">
      <style>{`
        .grid-stack {
          background: #f8f9fa;
          min-height: 500px;
          border-radius: 8px;
          padding: 16px;
        }

        .grid-stack-static .grid-stack-item {
          cursor: default !important;
        }

        .grid-stack-static .grid-stack-item .ui-resizable-handle {
          display: none !important;
        }

        .grid-stack-item-content {
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .grid-stack-item-content:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .grid-stack-item.ui-draggable-dragging .grid-stack-item-content {
          transform: rotate(2deg);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
        }

        .grid-stack-item.ui-resizable-resizing .grid-stack-item-content {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
        }

        /* Estilos para widgets ocultos */
        .grid-stack-item.opacity-30 {
          transition: opacity 0.3s ease;
        }

        .grid-stack-item.opacity-30 .grid-stack-item-content {
          border-style: dashed;
          background-color: #f9fafb;
        }

        /* Animación para cambios de visibilidad */
        .grid-stack-item {
          transition: opacity 0.3s ease, transform 0.2s ease;
        }

        /* Mejorar la visibilidad del botón del ojo */
        .grid-stack-item .eye-button {
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Dashboard de Clientes</h1>
              <p className="text-gray-600 mt-1">
                Gestiona la información de tus clientes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {visibleWidgetsCount}/{totalWidgetsCount} widgets visibles
              </span>
            </div>

            <Button
              variant={isEditMode ? "default" : "outline"}
              onClick={handleToggleEditMode}
              className="flex items-center gap-2"
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4" />
                  Modo Vista
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Modo Edición
                </>
              )}
            </Button>
          </div>
        </div>

        {isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Modo Edición Activo
                </span>
                <span className="text-sm text-blue-600">
                  Arrastra, redimensiona y gestiona la visibilidad. Los cambios
                  se guardan automáticamente.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restoreAllWidgets}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Restaurar Widgets
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveLayout}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Guardar Layout
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearStorage}
                  className="flex items-center gap-1"
                >
                  <Trash className="h-3 w-3" />
                  Limpiar Almacenamiento
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          {isEditMode ? (
            <p>
              🔧 <strong>Modo Edición:</strong> Arrastra los widgets para
              reordenarlos, redimensiona desde las esquinas, y usa el ícono 👁️
              para mostrar/ocultar elementos. Los cambios se guardan
              automáticamente.
            </p>
          ) : (
            <p>
              👀 <strong>Modo Vista:</strong> Los widgets están estáticos y
              optimizados para visualización de datos de clientes.
            </p>
          )}
        </div>
      </div>

      <div className="grid-container">
        <div
          ref={gridRef}
          className={`grid-stack ${!isEditMode ? "grid-stack-static" : ""}`}
        >
          {widgets.map((widget: GridWidgetData) => (
            <GridWidget
              key={widget.id}
              widget={widget}
              isEditMode={isEditMode}
              onToggleVisibility={toggleWidgetVisibility}
              onRemoveWidget={removeWidget}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
