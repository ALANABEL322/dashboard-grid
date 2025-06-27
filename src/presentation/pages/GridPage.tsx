import React, { useEffect, useCallback } from "react";
import {
  Users,
  Edit3,
  Eye,
  Save,
  RefreshCw,
  Trash,
  RotateCcw,
  Square,
} from "lucide-react";
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
    removeWidget,
    restoreAllWidgets,
    resetToDefaults,
    isDragging,
    syncPositionsFromDOM,
    saveCurrentLayout,
    containerBounds,
    forceGridStackSync,
  } = useGridstack(isEditMode, setIsEditMode);

  // Debug inicial optimizado
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

      // Verificar localStorage
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
  }, []); // Solo ejecutar una vez al montar

  const handleToggleEditMode = useCallback(() => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    // Si estamos ENTRANDO al modo edición, forzar sincronización desde store
    if (newEditMode) {
      logger.log(
        "GRIDPAGE",
        "Entrando al modo edición - forzando sincronización desde store"
      );

      // Dar tiempo a que GridStack se inicialice y luego forzar sync
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

    // Forzar sincronización desde DOM antes de guardar para mantener posiciones exactas
    syncPositionsFromDOM();

    // Delay para asegurar que la sincronización se complete antes de guardar
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

  // Memoizar cálculos
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

        /* Guías visuales de la grilla para snap automático */
        .grid-stack.edit-mode::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
          background-size: 
            calc(100% / 6) 78px,
            calc(100% / 6) 78px;
          pointer-events: none;
          z-index: 0;
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
              {hiddenWidgetsCount > 0 && (
                <span className="text-orange-600 font-medium">
                  ({hiddenWidgetsCount} ocultos)
                </span>
              )}
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
                  Arrastra, redimensiona y gestiona la visibilidad.
                  Posicionamiento libre en espacios vacíos + intercambio
                  automático sobre otros widgets.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hiddenWidgetsCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestoreWidgets}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Mostrar Ocultos ({hiddenWidgetsCount})
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Resetear Todo
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logger.log("DEBUG", "Forzando sincronización manual");
                    forceGridStackSync();
                  }}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Sincronizar
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

        {/* Información del contenedor delimitado */}
        {isEditMode && (
          <div className="container-info rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Square className="h-5 w-5 text-blue-600" />
                <div>
                  <span className="font-medium text-blue-900">
                    🏊‍♂️ Pecera con Posicionamiento Híbrido
                  </span>
                  <p className="text-sm text-blue-700 mt-1">
                    Los widgets se pueden <strong>POSICIONAR LIBREMENTE</strong>{" "}
                    en espacios vacíos y se{" "}
                    <strong>INTERCAMBIAN AUTOMÁTICAMENTE</strong> cuando se
                    arrastran sobre otros widgets dentro de la pecera de{" "}
                    <strong>
                      {WIDGET_CONFIG.CONTAINER.MAX_WIDTH} columnas
                    </strong>{" "}
                    x{" "}
                    <strong>{WIDGET_CONFIG.CONTAINER.MAX_HEIGHT} filas</strong>.{" "}
                    <span className="font-semibold text-blue-800">
                      Posicionamiento libre + intercambio automático + snap a
                      grilla.
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-sm text-blue-600">
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  🏊‍♂️ Pecera: {containerBounds.maxX}x{containerBounds.maxY}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          {isEditMode ? (
            <p>
              🔧 <strong>Modo Edición:</strong> Arrastra los widgets para
              posicionarlos libremente en espacios vacíos o intercambiarlos
              automáticamente cuando los arrastras sobre otros widgets.
              Redimensiona desde las esquinas, y usa el ícono 👁️ para
              mostrar/ocultar elementos.{" "}
              <strong className="text-blue-600">
                Posicionamiento libre en espacios vacíos + intercambio
                automático cuando hay colisión. Todo con snap a grilla.
              </strong>
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
              onRemoveWidget={removeWidget}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
