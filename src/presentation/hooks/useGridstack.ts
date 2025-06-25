import { useEffect, useRef, useCallback } from "react";
import { GridStack } from "gridstack";
import { useGridStore, type GridWidgetData } from "../stores/gridStore";

export type { GridWidgetData } from "../stores/gridStore";

export const useGridstack = (isEditMode: boolean) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstance = useRef<GridStack | null>(null);

  // Usar el store de Zustand
  const {
    widgets,
    isDragging,
    updateWidgetPosition,
    addWidget: addWidgetToStore,
    removeWidget: removeWidgetFromStore,
    toggleWidgetVisibility,
    setDragging,
    loadLayout,
    saveLayout,
  } = useGridStore();

  // Función para configurar event listeners
  const setupEventListeners = useCallback(
    (grid: GridStack) => {
      if (!isEditMode) return;

      // Limpiar listeners anteriores
      grid.off("dragstart resizestart");
      grid.off("dragstop resizestop");
      grid.off("change");

      // Configurar nuevos listeners
      grid.on("dragstart resizestart", (event: any, element: any) => {
        const widgetId = element.getAttribute("data-gs-id");
        if (widgetId) {
          setDragging(true, widgetId);
        }
      });

      grid.on("dragstop resizestop", (event: any, element: any) => {
        const widgetId = element.getAttribute("data-gs-id");
        if (widgetId) {
          // Obtener la posición actual del elemento en el DOM
          const x = parseInt(element.getAttribute("data-gs-x") || "0");
          const y = parseInt(element.getAttribute("data-gs-y") || "0");
          const w = parseInt(element.getAttribute("data-gs-w") || "1");
          const h = parseInt(element.getAttribute("data-gs-h") || "1");

          // Actualizar inmediatamente en el store
          updateWidgetPosition(widgetId, x, y, w, h);

          // Terminar el drag después de un pequeño delay
          setTimeout(() => {
            setDragging(false);
          }, 50);
        }
      });
    },
    [isEditMode, setDragging, updateWidgetPosition]
  );

  // Inicializar/Reinicializar GridStack cuando cambia el modo
  useEffect(() => {
    if (!gridRef.current) return;

    // Destruir instancia anterior si existe
    if (gridInstance.current) {
      try {
        gridInstance.current.destroy(false);
        gridInstance.current = null;
      } catch (error) {
        console.warn("Error destroying grid instance:", error);
        gridInstance.current = null;
      }
    }

    // Crear nueva instancia con configuración basada en el modo
    try {
      gridInstance.current = GridStack.init(
        {
          cellHeight: 70,
          acceptWidgets: true,
          removable: false,
          staticGrid: !isEditMode,
          animate: false,
          float: true,
          column: 6,
          margin: 8,
          minRow: 1,
          disableDrag: !isEditMode,
          disableResize: !isEditMode,
        },
        gridRef.current
      );

      // Configurar event listeners si estamos en modo edición
      if (gridInstance.current) {
        setupEventListeners(gridInstance.current);
      }

      console.log(
        `GridStack initialized in ${isEditMode ? "EDIT" : "VIEW"} mode`
      );
    } catch (error) {
      console.error("Error initializing GridStack:", error);
    }

    return () => {
      if (gridInstance.current) {
        try {
          gridInstance.current.destroy(false);
          gridInstance.current = null;
        } catch (error) {
          console.warn("Error in cleanup:", error);
          gridInstance.current = null;
        }
      }
    };
  }, [isEditMode, setupEventListeners]);

  // Función para agregar nuevo widget
  const addWidget = useCallback(() => {
    const newWidget: GridWidgetData = {
      id: `widget-${Date.now()}`,
      title: "New Widget",
      type: "custom",
      data: { message: "This is a new widget" },
      visible: true,
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    };

    addWidgetToStore(newWidget);
  }, [addWidgetToStore]);

  return {
    gridRef,
    widgets,
    toggleWidgetVisibility,
    addWidget,
    removeWidget: removeWidgetFromStore,
    saveLayout,
    loadLayout,
    isDragging,
  };
};
