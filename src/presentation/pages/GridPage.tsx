import React, { useState, useEffect } from "react";
import { Grid, Edit3, Eye, Save, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridWidget } from "../components/grid/GridWidget";
import { useGridstack } from "../hooks/useGridstack";
import { type GridWidgetData } from "../stores/gridStore";

// Importar estilos de Gridstack
import "gridstack/dist/gridstack.min.css";

export const GridPage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    gridRef,
    widgets,
    toggleWidgetVisibility,
    addWidget,
    removeWidget,
    saveLayout,
    loadLayout,
    isDragging,
  } = useGridstack(isEditMode);

  // Cargar layout guardado al inicializar
  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveLayout = () => {
    saveLayout();
    // Mostrar mensaje de éxito (puedes implementar un toast aquí)
    alert("Layout guardado exitosamente!");
  };

  const visibleWidgetsCount = widgets.filter((w) => w.visible).length;
  const totalWidgetsCount = widgets.length;

  return (
    <div className="p-6 h-full">
      {/* Estilos CSS */}
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

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Grid className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Grid Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Gestiona tu dashboard interactivo
              </p>
            </div>
          </div>

          {/* Switch de modo */}
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

        {/* Controles de edición */}
        {isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Modo Edición Activo
                </span>
                <span className="text-sm text-blue-600">
                  Arrastra, redimensiona y gestiona tus widgets
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWidget}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Agregar Widget
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadLayout}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Cargar
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
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="text-sm text-gray-500">
          {isEditMode ? (
            <p>
              🔧 <strong>Modo Edición:</strong> Arrastra los widgets para
              reordenarlos, redimensiona desde las esquinas, y usa el ícono 👁️
              para mostrar/ocultar elementos.
            </p>
          ) : (
            <p>
              👀 <strong>Modo Vista:</strong> Los widgets están estáticos y
              optimizados para visualización.
            </p>
          )}
        </div>
      </div>

      {/* Grid Container */}
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};
