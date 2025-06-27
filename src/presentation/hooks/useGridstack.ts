import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { GridStack } from "gridstack";
import { useGridStore, type GridWidgetData } from "../stores/gridStore";
import { WIDGET_CONFIG } from "@/shared/constants/widget.constants";
import { logger, validators, performance } from "@/shared/utils/utils";
import type {
  GridStackElement,
  GridStackEventHandler,
} from "@/shared/types/widget.types";

export type { GridWidgetData } from "../stores/gridStore";

interface ContainerBounds {
  width: number;
  height: number;
  maxX: number;
  maxY: number;
}

interface ConstrainedPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const useGridstack = (
  isEditMode: boolean,
  setIsEditMode?: (mode: boolean) => void
) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstance = useRef<GridStack | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [containerBounds, setContainerBounds] = useState<ContainerBounds>({
    width: 0,
    height: 0,
    maxX: WIDGET_CONFIG.CONTAINER.MAX_WIDTH,
    maxY: WIDGET_CONFIG.CONTAINER.MAX_HEIGHT,
  });

  const {
    widgets,
    isDragging,
    updateWidgetPosition,
    removeWidget: removeWidgetFromStore,
    toggleWidgetVisibility,
    setDragging,
    restoreAllWidgets,
    resetToDefaults,
    syncPositionsFromDOM,
    saveCurrentLayout,
  } = useGridStore();

  // Función ESTRICTA para validar y ajustar posiciones dentro del contenedor (Pecera 6x40)
  const constrainToContainer = useCallback(
    (x: number, y: number, w: number, h: number): ConstrainedPosition => {
      const { MAX_WIDTH, MAX_HEIGHT } = WIDGET_CONFIG.CONTAINER;

      // Sanitizar valores de entrada
      const sanitized = validators.sanitizePosition(x, y, w, h);

      // RESTRICCIONES ESTRICTAS - No permitir que se salga de la pecera
      const constrainedX = Math.max(
        0,
        Math.min(sanitized.x, MAX_WIDTH - sanitized.w)
      );
      const constrainedY = Math.max(
        0,
        Math.min(sanitized.y, MAX_HEIGHT - sanitized.h)
      );

      // Asegurar que el ancho y alto no excedan los límites disponibles
      const maxAllowedW = MAX_WIDTH - constrainedX;
      const maxAllowedH = MAX_HEIGHT - constrainedY;

      const constrainedW = Math.min(sanitized.w, maxAllowedW);
      const constrainedH = Math.min(sanitized.h, maxAllowedH);

      // VALIDACIÓN FINAL: Si el widget aún se sale, ajustar posición
      let finalX = constrainedX;
      let finalY = constrainedY;
      let finalW = constrainedW;
      let finalH = constrainedH;

      // Verificación adicional para casos extremos
      if (finalX + finalW > MAX_WIDTH) {
        finalX = Math.max(0, MAX_WIDTH - finalW);
      }
      if (finalY + finalH > MAX_HEIGHT) {
        finalY = Math.max(0, MAX_HEIGHT - finalH);
      }

      // Última verificación: reducir tamaño si es necesario
      if (finalX + finalW > MAX_WIDTH) {
        finalW = MAX_WIDTH - finalX;
      }
      if (finalY + finalH > MAX_HEIGHT) {
        finalH = MAX_HEIGHT - finalY;
      }

      const result = {
        x: finalX,
        y: finalY,
        w: Math.max(1, finalW), // Mínimo 1 de ancho
        h: Math.max(1, finalH), // Mínimo 1 de alto
      };

      // Log solo si hubo cambios significativos
      const hasChanges =
        result.x !== x || result.y !== y || result.w !== w || result.h !== h;
      if (hasChanges) {
        logger.log("CONTAINER", "🏊‍♂️ PECERA 6x40 - Widget restringido", {
          original: { x, y, w, h },
          constrained: result,
          containerLimits: { maxX: MAX_WIDTH, maxY: MAX_HEIGHT },
          reason:
            finalY + finalH > MAX_HEIGHT
              ? "Excedió límite altura"
              : finalX + finalW > MAX_WIDTH
              ? "Excedió límite ancho"
              : "Posición ajustada",
        });
      }

      return result;
    },
    []
  );

  // Función optimizada para actualizar los límites del contenedor
  const updateContainerBounds = useCallback(() => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const { MAX_WIDTH, MAX_HEIGHT } = WIDGET_CONFIG.CONTAINER;

    const newBounds: ContainerBounds = {
      width: rect.width,
      height: rect.height,
      maxX: MAX_WIDTH,
      maxY: MAX_HEIGHT,
    };

    setContainerBounds(newBounds);
    logger.log("CONTAINER", "Updated container bounds", newBounds);
  }, []);

  // Memoize widgets data to prevent unnecessary re-renders
  const memoizedWidgets = useMemo(() => {
    return widgets.map((w) => ({
      id: w.id,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
      visible: w.visible,
      title: w.title,
      type: w.type,
      data: w.data,
    }));
  }, [widgets]);

  // Inicialización con hydration optimizada
  useEffect(() => {
    const timer = setTimeout(() => {
      logger.log(
        "USEGRIDSTACK",
        "Zustand hydration completed, widgets ready",
        memoizedWidgets.map((w) => ({
          id: w.id,
          x: w.x,
          y: w.y,
          w: w.w,
          h: w.h,
        }))
      );
      setIsHydrated(true);
      updateContainerBounds();
    }, WIDGET_CONFIG.ANIMATION.HYDRATION_DELAY);

    return () => clearTimeout(timer);
  }, [memoizedWidgets, updateContainerBounds]);

  // Actualizar límites cuando cambie el tamaño de la ventana (con throttle para performance)
  useEffect(() => {
    const throttledResize = performance.throttle(updateContainerBounds, 250);

    window.addEventListener("resize", throttledResize);
    return () => window.removeEventListener("resize", throttledResize);
  }, [updateContainerBounds]);

  // Sincronización cuando se cambia el modo edición para mantener posiciones exactas
  useEffect(() => {
    if (!gridInstance.current || !gridRef.current) return;

    if (!isEditMode) {
      // Cuando se sale del modo edición, forzar sincronización completa
      logger.log(
        "USEGRIDSTACK",
        "Saliendo del modo edición - forzando sincronización"
      );

      const syncTimer = setTimeout(() => {
        syncPositionsFromDOM();
      }, 150);

      return () => clearTimeout(syncTimer);
    } else {
      // CRÍTICO: Cuando se ENTRA al modo edición, forzar sincronización desde el store
      logger.log(
        "USEGRIDSTACK",
        "Entrando al modo edición - forzando sincronización desde store"
      );

      const syncTimer = setTimeout(() => {
        // Forzar actualización de GridStack desde el store
        const grid = gridInstance.current;
        if (grid && gridRef.current) {
          memoizedWidgets.forEach((widget) => {
            const element = gridRef.current?.querySelector(
              `[data-gs-id="${widget.id}"]`
            ) as HTMLElement;

            if (element) {
              const node = (element as any).gridstackNode;

              // Comparar posiciones: store vs DOM
              const needsUpdate =
                !node ||
                node.x !== widget.x ||
                node.y !== widget.y ||
                node.w !== widget.w ||
                node.h !== widget.h;

              if (needsUpdate) {
                logger.log(
                  "SYNC",
                  `🔄 Sincronizando widget ${widget.id} desde store al entrar en modo edición`,
                  {
                    store: {
                      x: widget.x,
                      y: widget.y,
                      w: widget.w,
                      h: widget.h,
                    },
                    dom: node
                      ? { x: node.x, y: node.y, w: node.w, h: node.h }
                      : "no node",
                  }
                );

                try {
                  grid.update(element, {
                    x: widget.x,
                    y: widget.y,
                    w: widget.w,
                    h: widget.h,
                  });
                } catch (error) {
                  logger.warn("SYNC", `Error actualizando ${widget.id}`, error);

                  // Fallback: actualizar atributos DOM directamente
                  element.setAttribute("data-gs-x", widget.x.toString());
                  element.setAttribute("data-gs-y", widget.y.toString());
                  element.setAttribute("data-gs-w", widget.w.toString());
                  element.setAttribute("data-gs-h", widget.h.toString());
                }
              }
            }
          });
        }
      }, 200); // Dar más tiempo para que GridStack se inicialice completamente

      return () => clearTimeout(syncTimer);
    }
  }, [isEditMode, syncPositionsFromDOM, memoizedWidgets]);

  // Función para forzar sincronización desde store (similar al toggle visibility)
  const forceGridStackSync = useCallback(() => {
    const grid = gridInstance.current;
    if (!grid || !gridRef.current) return;

    logger.log(
      "USEGRIDSTACK",
      "🔄 Forzando sincronización completa desde store"
    );

    memoizedWidgets.forEach((widget) => {
      const element = gridRef.current?.querySelector(
        `[data-gs-id="${widget.id}"]`
      ) as HTMLElement;

      if (element && widget.visible) {
        const node = (element as any).gridstackNode;

        // Comparar posiciones: store vs GridStack
        const needsUpdate =
          !node ||
          node.x !== widget.x ||
          node.y !== widget.y ||
          node.w !== widget.w ||
          node.h !== widget.h;

        if (needsUpdate) {
          logger.log("SYNC", `🔄 Actualizando ${widget.id} desde store`, {
            store: { x: widget.x, y: widget.y, w: widget.w, h: widget.h },
            gridstack: node
              ? { x: node.x, y: node.y, w: node.w, h: node.h }
              : "no node",
          });

          try {
            grid.update(element, {
              x: widget.x,
              y: widget.y,
              w: widget.w,
              h: widget.h,
            });
          } catch (error) {
            logger.warn("SYNC", `Error actualizando ${widget.id}`, error);

            // Fallback: actualizar atributos DOM directamente
            element.setAttribute("data-gs-x", widget.x.toString());
            element.setAttribute("data-gs-y", widget.y.toString());
            element.setAttribute("data-gs-w", widget.w.toString());
            element.setAttribute("data-gs-h", widget.h.toString());
          }
        }
      }
    });
  }, [memoizedWidgets]);

  const saveAndExitEditMode = useCallback(() => {
    if (isEditMode && setIsEditMode) {
      // Forzar sincronización desde DOM antes de salir del modo edición
      syncPositionsFromDOM();

      // Pequeño delay para asegurar sincronización completa
      setTimeout(() => {
        setIsEditMode(false);
      }, 100);
    }
  }, [isEditMode, setIsEditMode, syncPositionsFromDOM]);

  // Configuración optimizada de event listeners
  const setupEventListeners = useCallback(
    (grid: GridStack) => {
      if (!isEditMode) return;

      // Limpiar listeners existentes
      grid.off("dragstart resizestart dragstop resizestop drag resize change");

      logger.log(
        "GRIDSTACK",
        "Setting up event listeners for edit mode with container constraints"
      );

      // Event listeners optimizados
      grid.on("dragstart resizestart", (event: any, element: any) => {
        const widgetId = element.getAttribute("data-gs-id");
        if (validators.isValidWidgetId(widgetId || "")) {
          logger.log("GRIDSTACK", `Started ${event.type} widget: ${widgetId}`);
          setDragging(true, widgetId || undefined);
        }
      });

      grid.on("dragstop resizestop", (event: any, element: any) => {
        logger.log("GRIDSTACK", `${event.type} event triggered`);

        if (element && typeof element.getAttribute === "function") {
          const widgetId = element.getAttribute("data-gs-id");
          if (validators.isValidWidgetId(widgetId || "")) {
            const node = element.gridstackNode;
            if (
              node &&
              validators.isValidPosition(node.x, node.y, node.w, node.h)
            ) {
              // Aplicar restricciones del contenedor
              const constrained = constrainToContainer(
                node.x,
                node.y,
                node.w,
                node.h
              );

              logger.log(
                "GRIDSTACK",
                `Widget ${widgetId} constrained position`,
                {
                  original: { x: node.x, y: node.y, w: node.w, h: node.h },
                  constrained,
                }
              );

              // Si la posición cambió por las restricciones, actualizar el DOM
              if (
                constrained.x !== node.x ||
                constrained.y !== node.y ||
                constrained.w !== node.w ||
                constrained.h !== node.h
              ) {
                logger.log(
                  "GRIDSTACK",
                  `Applying container constraints to ${widgetId}`
                );

                // Actualizar la posición en GridStack
                try {
                  grid.update(element, constrained);
                } catch (error) {
                  logger.warn(
                    "GRIDSTACK",
                    `Error applying constraints to ${widgetId}`,
                    error
                  );

                  // Fallback: actualizar atributos directamente
                  element.setAttribute("data-gs-x", constrained.x.toString());
                  element.setAttribute("data-gs-y", constrained.y.toString());
                  element.setAttribute("data-gs-w", constrained.w.toString());
                  element.setAttribute("data-gs-h", constrained.h.toString());
                }
              }

              // Aplicar restricciones del contenedor SOLO al finalizar
              const finalConstrained = constrainToContainer(
                node.x,
                node.y,
                node.w,
                node.h
              );

              // Si la posición final está fuera de límites, aplicar restricciones
              if (
                finalConstrained.x !== node.x ||
                finalConstrained.y !== node.y ||
                finalConstrained.w !== node.w ||
                finalConstrained.h !== node.h
              ) {
                logger.log(
                  "CONTAINER",
                  `🏊‍♂️ PECERA - Aplicando restricciones finales a ${widgetId}`,
                  {
                    original: { x: node.x, y: node.y, w: node.w, h: node.h },
                    constrained: finalConstrained,
                  }
                );

                try {
                  grid.update(element, finalConstrained);
                } catch (error) {
                  logger.warn(
                    "GRIDSTACK",
                    `Error aplicando restricciones finales a ${widgetId}`,
                    error
                  );
                }
              }

              updateWidgetPosition(
                widgetId!,
                finalConstrained.x,
                finalConstrained.y,
                finalConstrained.w,
                finalConstrained.h
              );
            } else {
              updateWidgetPosition(widgetId!, node.x, node.y, node.w, node.h);
            }
          }
        }

        logger.log("GRIDSTACK", `Finished ${event.type} operation`);
        setDragging(false);

        // Sincronización forzada después de operaciones de drag/resize
        setTimeout(() => {
          syncPositionsFromDOM();
        }, 100);
      });

      // Validación ligera durante drag/resize - Solo logging, no interferir con movimiento
      grid.on("drag resize", (event: any, element: any) => {
        const node = element.gridstackNode;
        if (
          node &&
          validators.isValidPosition(node.x, node.y, node.w, node.h)
        ) {
          const { MAX_WIDTH, MAX_HEIGHT } = WIDGET_CONFIG.CONTAINER;
          const widgetId = element.getAttribute("data-gs-id");

          // Solo logging para debugging, no aplicar restricciones durante el drag
          if (
            node.x < 0 ||
            node.y < 0 ||
            node.x + node.w > MAX_WIDTH ||
            node.y + node.h > MAX_HEIGHT
          ) {
            logger.log(
              "CONTAINER",
              `🏊‍♂️ PECERA - Widget ${widgetId} cerca del límite`,
              {
                current: { x: node.x, y: node.y, w: node.w, h: node.h },
                limits: { maxX: MAX_WIDTH, maxY: MAX_HEIGHT },
              }
            );
          }
        }
      });

      // Event listener específico para intercambio de widgets
      grid.on("change", (event: any, items: any[]) => {
        // Solo procesar si hay múltiples widgets cambiando (intercambio real)
        if (items && items.length > 1) {
          logger.log("GRIDSTACK", "🔄 Intercambio de widgets detectado", {
            changedItems: items.map((item) => ({
              id: item.el?.getAttribute("data-gs-id"),
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
            })),
          });

          // Actualizar posiciones de todos los widgets afectados por el intercambio
          items.forEach((item: any) => {
            if (item.el) {
              const widgetId = item.el.getAttribute("data-gs-id");
              if (validators.isValidWidgetId(widgetId || "")) {
                const constrained = constrainToContainer(
                  item.x,
                  item.y,
                  item.w,
                  item.h
                );

                logger.log(
                  "GRIDSTACK",
                  `Actualizando posición por intercambio: ${widgetId}`,
                  {
                    original: { x: item.x, y: item.y, w: item.w, h: item.h },
                    constrained,
                  }
                );

                updateWidgetPosition(
                  widgetId!,
                  constrained.x,
                  constrained.y,
                  constrained.w,
                  constrained.h
                );
              }
            }
          });
        } else if (items && items.length === 1) {
          // Movimiento libre a espacio vacío - permitir posicionamiento libre
          const item = items[0];
          if (item.el) {
            const widgetId = item.el.getAttribute("data-gs-id");
            if (validators.isValidWidgetId(widgetId || "")) {
              const constrained = constrainToContainer(
                item.x,
                item.y,
                item.w,
                item.h
              );

              logger.log("GRIDSTACK", `🎯 Posicionamiento libre: ${widgetId}`, {
                original: { x: item.x, y: item.y, w: item.w, h: item.h },
                constrained,
              });

              updateWidgetPosition(
                widgetId!,
                constrained.x,
                constrained.y,
                constrained.w,
                constrained.h
              );
            }
          }
        }
      });
    },
    [
      isEditMode,
      setDragging,
      updateWidgetPosition,
      constrainToContainer,
      syncPositionsFromDOM,
    ]
  );

  // Opciones de GridStack optimizadas para movimiento fluido en pecera 6x40
  const gridOptions = useMemo(
    () => ({
      cellHeight: WIDGET_CONFIG.GRID.CELL_HEIGHT,
      acceptWidgets: ".grid-stack-item", // Permitir widgets externos
      removable: false,
      staticGrid: !isEditMode,
      animate: true, // Permitir animaciones para movimiento más fluido
      float: true, // CRÍTICO: true para permitir posicionamiento libre en espacios vacíos
      column: WIDGET_CONFIG.CONTAINER.MAX_WIDTH,
      margin: WIDGET_CONFIG.GRID.MARGIN,
      minRow: WIDGET_CONFIG.CONTAINER.MIN_HEIGHT,
      maxRow: WIDGET_CONFIG.CONTAINER.MAX_HEIGHT, // 40 filas
      disableDrag: !isEditMode,
      disableResize: !isEditMode,
      resizable: {
        handles: "se",
        // Snap to grid durante resize
        grid: [
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
        ],
      },
      // Configuración para snap automático a la grilla
      verticalMargin: WIDGET_CONFIG.GRID.MARGIN,
      alwaysShowResizeHandle: isEditMode,
      // Restricciones básicas del contenedor
      minW: 1,
      maxW: WIDGET_CONFIG.CONTAINER.MAX_WIDTH,
      minH: 1,
      maxH: WIDGET_CONFIG.CONTAINER.MAX_HEIGHT,
      // Configuraciones para snap to grid y mejor experiencia de drag
      dragIn: ".grid-stack-item",
      dragInOptions: {
        revert: "invalid",
        scroll: false,
        appendTo: "body",
        helper: "clone",
        // CRÍTICO: Configuración para snap automático a la grilla
        snap: true, // Habilitar snap automático
        snapMode: "both", // Snap en ambas direcciones
        snapTolerance: 10, // Tolerancia para snap automático
        grid: [
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
        ], // Snap a las divisiones de la grilla
      },
      // Configuración para draggable interno (widgets existentes)
      draggable: {
        handle: ".grid-stack-item-content",
        scroll: false,
        appendTo: "body",
        // CRÍTICO: Snap automático para widgets internos también
        snap: true,
        snapMode: "both",
        snapTolerance: 10,
        grid: [
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
        ],
      },
    }),
    [isEditMode]
  );

  // Inicialización optimizada de GridStack
  useEffect(() => {
    if (!gridRef.current || !isHydrated) {
      logger.log("USEGRIDSTACK", "Waiting for hydration or grid ref", {
        hasGridRef: !!gridRef.current,
        isHydrated,
      });
      return;
    }

    logger.log(
      "USEGRIDSTACK",
      "Initializing GridStack with container constraints"
    );

    // Cleanup anterior
    if (gridInstance.current) {
      try {
        logger.log("USEGRIDSTACK", "Destroying previous GridStack instance");
        gridInstance.current.destroy(false);
        gridInstance.current = null;
      } catch (error) {
        logger.warn("USEGRIDSTACK", "Error destroying grid instance", error);
        gridInstance.current = null;
      }
    }

    // Inicialización
    try {
      logger.log(
        "USEGRIDSTACK",
        "Creating GridStack with container options",
        gridOptions
      );
      gridInstance.current = GridStack.init(gridOptions, gridRef.current);

      if (gridInstance.current) {
        logger.log(
          "USEGRIDSTACK",
          "GridStack initialized successfully with container constraints"
        );
        setupEventListeners(gridInstance.current);
        updateContainerBounds();

        // CRÍTICO: Configurar snap automático después de la inicialización
        if (isEditMode) {
          const grid = gridInstance.current;

          // Configurar snap automático usando la API nativa de GridStack
          setTimeout(() => {
            // Forzar que GridStack use snap automático para posicionamiento
            if (grid && (grid as any).opts) {
              // Configurar opciones de snap directamente en la instancia
              (grid as any).opts.snapToGrid = true;
              (grid as any).opts.snapTolerance = 10;

              logger.log(
                "USEGRIDSTACK",
                "Snap-to-grid configurado en la instancia de GridStack"
              );
            }

            // Configurar guías visuales para la grilla
            if (gridRef.current) {
              gridRef.current.style.backgroundImage = `
                linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
              `;
              gridRef.current.style.backgroundSize = `${
                ((WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN) /
                  WIDGET_CONFIG.CONTAINER.MAX_WIDTH) *
                100
              }% ${
                WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN
              }px`;
            }
          }, 100);
        }

        // Exponer instancia globalmente para sincronización desde store
        (window as any).gridInstance = gridInstance.current;
      }
    } catch (error) {
      logger.error("USEGRIDSTACK", "Error initializing GridStack", error);
    }

    return () => {
      if (gridInstance.current) {
        try {
          logger.log("USEGRIDSTACK", "Cleanup: destroying GridStack instance");
          gridInstance.current.destroy(false);
          gridInstance.current = null;
        } catch (error) {
          logger.warn("USEGRIDSTACK", "Error in cleanup", error);
          gridInstance.current = null;
        }
      }

      // Limpiar referencia global
      if ((window as any).gridInstance) {
        (window as any).gridInstance = null;
      }
    };
  }, [
    isEditMode,
    setupEventListeners,
    isHydrated,
    gridOptions,
    updateContainerBounds,
  ]);

  // Sincronización optimizada de widgets con throttling
  useEffect(() => {
    if (
      !gridInstance.current ||
      !gridRef.current ||
      !isHydrated ||
      isDragging
    ) {
      return;
    }

    logger.log(
      "USEGRIDSTACK",
      "Syncing store data to DOM with container constraints",
      memoizedWidgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))
    );

    const syncFrame = requestAnimationFrame(() => {
      const grid = gridInstance.current;
      if (!grid || isDragging) return;

      memoizedWidgets.forEach((widget) => {
        const element = gridRef.current?.querySelector(
          `[data-gs-id="${widget.id}"]`
        ) as GridStackElement;

        if (element) {
          const node = element.gridstackNode;

          // Aplicar restricciones del contenedor a los datos del store
          const constrained = constrainToContainer(
            widget.x,
            widget.y,
            widget.w,
            widget.h
          );

          const needsUpdate =
            !node ||
            node.x !== constrained.x ||
            node.y !== constrained.y ||
            node.w !== constrained.w ||
            node.h !== constrained.h;

          if (needsUpdate) {
            logger.log(
              "USEGRIDSTACK",
              `Updating GridStack for ${widget.id} with constraints`,
              {
                from: node
                  ? { x: node.x, y: node.y, w: node.w, h: node.h }
                  : "no node",
                to: constrained,
              }
            );

            try {
              grid.update(element, constrained);

              // Si se aplicaron restricciones, actualizar el store
              if (
                constrained.x !== widget.x ||
                constrained.y !== widget.y ||
                constrained.w !== widget.w ||
                constrained.h !== widget.h
              ) {
                updateWidgetPosition(
                  widget.id,
                  constrained.x,
                  constrained.y,
                  constrained.w,
                  constrained.h
                );
              }
            } catch (error) {
              logger.warn("USEGRIDSTACK", `Error updating ${widget.id}`, error);

              element.setAttribute("data-gs-x", constrained.x.toString());
              element.setAttribute("data-gs-y", constrained.y.toString());
              element.setAttribute("data-gs-w", constrained.w.toString());
              element.setAttribute("data-gs-h", constrained.h.toString());
            }
          }
        }
      });
    });

    return () => cancelAnimationFrame(syncFrame);
  }, [
    memoizedWidgets,
    isHydrated,
    isDragging,
    constrainToContainer,
    updateWidgetPosition,
  ]);

  return {
    gridRef,
    widgets: memoizedWidgets,
    toggleWidgetVisibility,
    removeWidget: removeWidgetFromStore,
    restoreAllWidgets,
    resetToDefaults,
    saveAndExitEditMode,
    isDragging,
    syncPositionsFromDOM,
    saveCurrentLayout,
    containerBounds,
    constrainToContainer,
    forceGridStackSync,
  };
};
