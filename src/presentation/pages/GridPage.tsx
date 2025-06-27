import React, { useEffect, useCallback } from "react";
import { Users, Edit3, Eye, Save, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { GridWidget } from "../components/grid/GridWidget";
import { useGridstack } from "../hooks/useGridstack";
import { useEditMode } from "../components/layout/AppLayout";
import { type GridWidgetData } from "../stores/gridStore";
import { type StoredGridData } from "@/shared/types/widget.types";
import { ProjectAlerts } from "@/shared/utils/sweetAlert";
import { WIDGET_CONFIG } from "@/shared/constants/widget.constants";
import { logger } from "@/shared/utils/utils";

import "gridstack/dist/gridstack.min.css";

export function GridPage() {
  const { isEditMode, setIsEditMode } = useEditMode();
  const {
    gridRef,
    widgets,
    toggleWidgetVisibility,
    restoreAllWidgets,
    resetToDefaults,
    isDragging,
    syncPositionsFromDOM,
    saveCurrentLayout,
    containerBounds,
    forceGridStackSync,
  } = useGridstack(isEditMode, setIsEditMode);

  useEffect(() => {
    logger.group("GRIDPAGE", "Component mounted - Initial state", () => {
      const currentWidgets = widgets.map((w) => ({
        id: w.id,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
        visible: w.visible,
      }));

      logger.log("GRIDPAGE", "Current widgets from store", currentWidgets);

      const stored = localStorage.getItem("grid-storage");
      if (stored) {
        try {
          const parsed: StoredGridData = JSON.parse(stored);
          const storedWidgets = parsed.state?.widgets?.map((w) => ({
            id: w.id,
            x: w.x,
            y: w.y,
            w: w.w,
            h: w.h,
            visible: w.visible,
          }));
          logger.log("GRIDPAGE", "Data in localStorage", storedWidgets);
        } catch (error) {
          logger.error("GRIDPAGE", "Error reading localStorage", error);
        }
      } else {
        logger.log("GRIDPAGE", "No data found in localStorage");
      }
    });
  }, []);

  const handleToggleEditMode = useCallback(() => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    if (newEditMode) {
      logger.log(
        "GRIDPAGE",
        "Entrando al modo edición - forzando sincronización desde store"
      );

      setTimeout(() => {
        forceGridStackSync();
      }, 300);
    }
  }, [isEditMode, setIsEditMode, forceGridStackSync]);

  const handleSaveLayout = useCallback(() => {
    logger.log("UI", "Manual save button clicked");
    logger.log(
      "UI",
      "Current widget positions before save",
      widgets.map((w) => ({
        id: w.id,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
        visible: w.visible,
      }))
    );

    syncPositionsFromDOM();

    setTimeout(() => {
      saveCurrentLayout();
      setIsEditMode(false);
      ProjectAlerts.layoutSaved();
    }, 150);
  }, [widgets, saveCurrentLayout, setIsEditMode, syncPositionsFromDOM]);

  const handleRestoreWidgets = useCallback(async () => {
    const result = await ProjectAlerts.confirm(
      "Mostrar Widgets Ocultos",
      "¿Quieres mostrar todos los widgets ocultos? Mantendrán sus posiciones y tamaños guardados.",
      "Mostrar Todos",
      "Cancelar"
    );

    if (result.isConfirmed) {
      restoreAllWidgets();
      await ProjectAlerts.success(
        "Widgets Restaurados",
        "Todos los widgets ocultos ahora son visibles con sus configuraciones guardadas."
      );
    }
  }, [restoreAllWidgets]);

  const handleResetToDefaults = useCallback(async () => {
    const result = await ProjectAlerts.confirm(
      "Resetear a Configuración Inicial",
      "¿Estás seguro? Esto eliminará todas las personalizaciones y volverá a la configuración por defecto.",
      "Resetear Todo",
      "Cancelar"
    );

    if (result.isConfirmed) {
      resetToDefaults();
      await ProjectAlerts.success(
        "Configuración Reseteada",
        "Todos los widgets han vuelto a su configuración inicial."
      );
    }
  }, [resetToDefaults]);

  const handleClearStorage = useCallback(async () => {
    const result = await ProjectAlerts.clearStorageConfirm();

    if (result.isConfirmed) {
      localStorage.removeItem("grid-storage");
      resetToDefaults();
      await ProjectAlerts.storageCleared();
      window.location.reload();
    }
  }, [resetToDefaults]);

  const visibleWidgetsCount = widgets.filter((w) => w.visible).length;
  const totalWidgetsCount = widgets.length;
  const hiddenWidgetsCount = totalWidgetsCount - visibleWidgetsCount;

  return (
    <div className="p-6 h-full">
      <style>{`
        .grid-stack {
          background: #f8f9fa;
          /* PECERA - Altura fija calculada: 40 filas × (70px + 8px) + 32px padding = 3152px */
          height: ${
            WIDGET_CONFIG.CONTAINER.MAX_HEIGHT *
              (WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN) +
            WIDGET_CONFIG.CONTAINER.PADDING * 2
          }px;
          max-height: ${
            WIDGET_CONFIG.CONTAINER.MAX_HEIGHT *
              (WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN) +
            WIDGET_CONFIG.CONTAINER.PADDING * 2
          }px;
          min-height: ${
            WIDGET_CONFIG.CONTAINER.MIN_HEIGHT *
              (WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN) +
            WIDGET_CONFIG.CONTAINER.PADDING * 2
          }px;
          border-radius: 8px;
          padding: 16px;
          /* Contenedor delimitado (pecera) - ALTURA FIJA NO EXPANDIBLE */
          position: relative;
          border: 2px solid #e2e8f0;
          overflow: hidden; /* Ocultar contenido que se salga de los límites */
          box-sizing: border-box;
        }

        /* Indicador visual del contenedor en modo edición - MEJORADO PARA MOVIMIENTO */
        .grid-stack.edit-mode {
          border: 2px dashed #3b82f6;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1);
          /* Mejorar el movimiento de widgets */
          position: relative;
          z-index: 1;
        }



        .grid-stack.edit-mode::after {
          content: '🏊‍♂️ Pecera 6x40 - Posicionamiento Libre + Intercambio';
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          pointer-events: none;
          z-index: 1;
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
          position: relative;
          z-index: 2;
        }

        .grid-stack-item-content:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Mejorar el estilo durante drag para mejor feedback visual */
        .grid-stack-item.ui-draggable-dragging .grid-stack-item-content {
          transform: rotate(1deg) scale(1.02);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          opacity: 0.9;
          border: 2px solid #3b82f6;
        }

        .grid-stack-item.ui-resizable-resizing .grid-stack-item-content {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          border: 2px solid #10b981;
        }

        /* Mejorar el placeholder durante drag */
        .grid-stack-placeholder {
          background: rgba(59, 130, 246, 0.2) !important;
          border: 2px dashed #3b82f6 !important;
          border-radius: 8px !important;
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

        /* Indicador de límites del contenedor */
        .container-info {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 1px solid #93c5fd;
        }
      `}</style>

      <div className="mb-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Dashboard de Clientes
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Gestiona la información de tus clientes
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {visibleWidgetsCount}/{totalWidgetsCount} widgets visibles
              </span>
              {hiddenWidgetsCount > 0 && (
                <span className="text-orange-600 font-medium">
                  ({hiddenWidgetsCount} ocultos)
                </span>
              )}
            </div>

            <Button
              variant={isEditMode ? "default" : "outline"}
              onClick={handleToggleEditMode}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Modo Vista</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Modo Edición</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium text-blue-900 block sm:inline">
                    Modo Edición Activo
                  </span>
                  <span className="text-sm text-blue-600 block sm:inline sm:ml-2">
                    Arrastra, redimensiona y gestiona la visibilidad.
                    Posicionamiento libre en espacios vacíos.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {hiddenWidgetsCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestoreWidgets}
                    className="flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">Mostrar Ocultos</span>
                    <span className="sm:hidden">Mostrar</span> (
                    {hiddenWidgetsCount})
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-1 text-xs sm:text-sm"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="hidden sm:inline">Resetear Todo</span>
                  <span className="sm:hidden">Reset</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveLayout}
                  className="flex items-center gap-1 text-xs sm:text-sm"
                >
                  <Save className="h-3 w-3" />
                  <span className="hidden sm:inline">Guardar Layout</span>
                  <span className="sm:hidden">Guardar</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          {isEditMode ? (
            <p className="text-sm sm:text-base">
              🔧 <strong>Modo Edición:</strong> Arrastra los widgets para
              posicionarlos libremente en espacios vacíos. Redimensiona desde
              las esquinas, y usa el ícono 👁️ para mostrar/ocultar elementos.{" "}
              <span className="text-blue-600 font-medium">
                Posicionamiento libre en espacios vacíos. Todo con snap a
                grilla.
              </span>
            </p>
          ) : (
            <p className="text-sm sm:text-base">
              👀 <strong>Modo Vista:</strong> Los widgets están estáticos y
              optimizados para visualización de datos de clientes.
            </p>
          )}
        </div>
      </div>

      <div className="grid-container">
        <div
          ref={gridRef}
          className={`grid-stack ${
            !isEditMode ? "grid-stack-static" : "edit-mode"
          }`}
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
}
