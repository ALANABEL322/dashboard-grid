import { useEffect, useRef, useCallback, useState } from "react";
import { GridStack } from "gridstack";
import { useGridStore, type GridWidgetData } from "../stores/gridStore";

export type { GridWidgetData } from "../stores/gridStore";

export const useGridstack = (
  isEditMode: boolean,
  setIsEditMode?: (mode: boolean) => void
) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstance = useRef<GridStack | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    widgets,
    isDragging,
    updateWidgetPosition,
    removeWidget: removeWidgetFromStore,
    toggleWidgetVisibility,
    setDragging,
    restoreAllWidgets,
    setWidgetPage,
    getWidgetPage,
    syncPositionsFromDOM,
    saveCurrentLayout,
  } = useGridStore();

  // Verificar cuando Zustand ha terminado la hidratación
  useEffect(() => {
    // Dar un pequeño delay para asegurar que la hidratación se complete
    const timer = setTimeout(() => {
      console.log(
        "[USEGRIDSTACK] Zustand hydration completed, widgets ready:",
        widgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))
      );
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Función para guardar automáticamente cuando se sale del modo edición
  const saveAndExitEditMode = useCallback(() => {
    if (isEditMode && setIsEditMode) {
      setIsEditMode(false);
    }
  }, [isEditMode, setIsEditMode]);

  // Función para configurar event listeners
  const setupEventListeners = useCallback(
    (grid: GridStack) => {
      if (!isEditMode) return;

      // Limpiar listeners anteriores
      grid.off(
        "dragstart resizestart dragstop resizestop change added removed"
      );

      console.log("[GRIDSTACK] Setting up event listeners for edit mode");

      // Listener para inicio de interacción
      grid.on("dragstart resizestart", (event: any, element: any) => {
        const widgetId = element.getAttribute("data-gs-id");
        if (widgetId) {
          console.log(`[GRIDSTACK] Started ${event.type} widget: ${widgetId}`);
          setDragging(true, widgetId);
        }
      });

      // Listener principal para fin de interacción - SOLO dragstop y resizestop
      grid.on("dragstop resizestop", (event: any, element: any) => {
        console.log(`[GRIDSTACK] ${event.type} event triggered`);

        if (element && typeof element.getAttribute === "function") {
          const widgetId = element.getAttribute("data-gs-id");
          if (widgetId) {
            // Obtener posiciones directamente del GridStack node
            const node = (element as any).gridstackNode;
            if (node) {
              console.log(`[GRIDSTACK] Widget ${widgetId} final position:`, {
                x: node.x,
                y: node.y,
                w: node.w,
                h: node.h,
              });

              // Actualizar el store con la nueva posición
              updateWidgetPosition(widgetId, node.x, node.y, node.w, node.h);
            }
          }
        }

        console.log(`[GRIDSTACK] Finished ${event.type} operation`);
        setDragging(false);
      });
    },
    [isEditMode, setDragging, updateWidgetPosition]
  );

  // Inicializar GridStack solo después de la hidratación
  useEffect(() => {
    if (!gridRef.current || !isHydrated) {
      console.log("[USEGRIDSTACK] Waiting for hydration or grid ref...", {
        hasGridRef: !!gridRef.current,
        isHydrated,
      });
      return;
    }

    console.log("[USEGRIDSTACK] Initializing GridStack with hydrated data...");

    // Destruir instancia anterior si existe
    if (gridInstance.current) {
      try {
        console.log("[USEGRIDSTACK] Destroying previous GridStack instance");
        gridInstance.current.destroy(false);
        gridInstance.current = null;
      } catch (error) {
        console.warn("Error destroying grid instance:", error);
        gridInstance.current = null;
      }
    }

    // Crear nueva instancia
    try {
      const gridOptions = {
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
        // Opciones adicionales para estabilidad
        resizable: {
          handles: "e, se, s, sw, w",
        },
      };

      console.log(
        "[USEGRIDSTACK] Creating GridStack with options:",
        gridOptions
      );
      gridInstance.current = GridStack.init(gridOptions, gridRef.current);

      if (gridInstance.current) {
        console.log("[USEGRIDSTACK] GridStack initialized successfully");
        setupEventListeners(gridInstance.current);
      }
    } catch (error) {
      console.error("Error initializing GridStack:", error);
    }

    return () => {
      if (gridInstance.current) {
        try {
          console.log("[USEGRIDSTACK] Cleanup: destroying GridStack instance");
          gridInstance.current.destroy(false);
          gridInstance.current = null;
        } catch (error) {
          console.warn("Error in cleanup:", error);
          gridInstance.current = null;
        }
      }
    };
  }, [isEditMode, setupEventListeners, isHydrated]);

  // Sincronizar posiciones del store con DOM
  useEffect(() => {
    if (
      !gridInstance.current ||
      !gridRef.current ||
      !isHydrated ||
      isDragging
    ) {
      console.log("[USEGRIDSTACK] Sync skipped, waiting for:", {
        hasGridInstance: !!gridInstance.current,
        hasGridRef: !!gridRef.current,
        isHydrated,
        isDragging,
      });
      return;
    }

    console.log(
      "[USEGRIDSTACK] Syncing store data to DOM:",
      widgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))
    );

    const syncFrame = requestAnimationFrame(() => {
      const grid = gridInstance.current;
      if (!grid || isDragging) return; // Evitar sync durante drag

      // Usar GridStack.update() para sincronizar posiciones
      widgets.forEach((widget) => {
        const element = gridRef.current?.querySelector(
          `[data-gs-id="${widget.id}"]`
        ) as HTMLElement;

        if (element) {
          const node = (element as any).gridstackNode;

          // Verificar si necesitamos actualizar
          const needsUpdate =
            !node ||
            node.x !== widget.x ||
            node.y !== widget.y ||
            node.w !== widget.w ||
            node.h !== widget.h;

          if (needsUpdate) {
            console.log(`[USEGRIDSTACK] Updating GridStack for ${widget.id}:`, {
              from: node
                ? { x: node.x, y: node.y, w: node.w, h: node.h }
                : "no node",
              to: { x: widget.x, y: widget.y, w: widget.w, h: widget.h },
            });

            try {
              // Usar GridStack.update() para mover el elemento
              grid.update(element, {
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
              });
            } catch (error) {
              console.warn(
                `[USEGRIDSTACK] Error updating ${widget.id}:`,
                error
              );

              // Fallback: actualizar atributos DOM directamente
              element.setAttribute("data-gs-x", widget.x.toString());
              element.setAttribute("data-gs-y", widget.y.toString());
              element.setAttribute("data-gs-w", widget.w.toString());
              element.setAttribute("data-gs-h", widget.h.toString());
            }
          }
        }
      });

      // NO hacer commit automático para evitar eventos en cascada
    });

    return () => cancelAnimationFrame(syncFrame);
  }, [widgets, isHydrated]); // Remover isDragging de dependencies

  return {
    gridRef,
    widgets,
    toggleWidgetVisibility,
    removeWidget: removeWidgetFromStore,
    restoreAllWidgets,
    saveAndExitEditMode,
    isDragging,
    syncPositionsFromDOM,
    saveCurrentLayout,
  };
};
