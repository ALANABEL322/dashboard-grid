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
    toggleWidgetVisibility,
    setDragging,
    restoreAllWidgets,
    resetToDefaults,
    syncPositionsFromDOM,
    saveCurrentLayout,
  } = useGridStore();

  const constrainToContainer = useCallback(
    (x: number, y: number, w: number, h: number): ConstrainedPosition => {
      const { MAX_WIDTH, MAX_HEIGHT } = WIDGET_CONFIG.CONTAINER;

      const sanitized = validators.sanitizePosition(x, y, w, h);

      const constrainedX = Math.max(
        0,
        Math.min(sanitized.x, MAX_WIDTH - sanitized.w)
      );
      const constrainedY = Math.max(
        0,
        Math.min(sanitized.y, MAX_HEIGHT - sanitized.h)
      );

      const maxAllowedW = MAX_WIDTH - constrainedX;
      const maxAllowedH = MAX_HEIGHT - constrainedY;

      const constrainedW = Math.min(sanitized.w, maxAllowedW);
      const constrainedH = Math.min(sanitized.h, maxAllowedH);

      let finalX = constrainedX;
      let finalY = constrainedY;
      let finalW = constrainedW;
      let finalH = constrainedH;

      if (finalX + finalW > MAX_WIDTH) {
        finalX = Math.max(0, MAX_WIDTH - finalW);
      }
      if (finalY + finalH > MAX_HEIGHT) {
        finalY = Math.max(0, MAX_HEIGHT - finalH);
      }

      if (finalX + finalW > MAX_WIDTH) {
        finalW = MAX_WIDTH - finalX;
      }
      if (finalY + finalH > MAX_HEIGHT) {
        finalH = MAX_HEIGHT - finalY;
      }

      const result = {
        x: finalX,
        y: finalY,
        w: Math.max(1, finalW),
        h: Math.max(1, finalH),
      };

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

  useEffect(() => {
    const throttledResize = performance.throttle(updateContainerBounds, 250);

    window.addEventListener("resize", throttledResize);
    return () => window.removeEventListener("resize", throttledResize);
  }, [updateContainerBounds]);

  useEffect(() => {
    if (!gridInstance.current || !gridRef.current) return;

    if (!isEditMode) {
      logger.log(
        "USEGRIDSTACK",
        "Saliendo del modo edición - forzando sincronización"
      );

      const syncTimer = setTimeout(() => {
        syncPositionsFromDOM();
      }, 150);

      return () => clearTimeout(syncTimer);
    } else {
      logger.log(
        "USEGRIDSTACK",
        "Entrando al modo edición - forzando sincronización desde store"
      );

      const syncTimer = setTimeout(() => {
        const grid = gridInstance.current;
        if (grid && gridRef.current) {
          memoizedWidgets.forEach((widget) => {
            const element = gridRef.current?.querySelector(
              `[data-gs-id="${widget.id}"]`
            ) as HTMLElement;

            if (element) {
              const node = (element as any).gridstackNode;

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

                  element.setAttribute("data-gs-x", widget.x.toString());
                  element.setAttribute("data-gs-y", widget.y.toString());
                  element.setAttribute("data-gs-w", widget.w.toString());
                  element.setAttribute("data-gs-h", widget.h.toString());
                }
              }
            }
          });
        }
      }, 200);

      return () => clearTimeout(syncTimer);
    }
  }, [isEditMode, syncPositionsFromDOM, memoizedWidgets]);

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
      syncPositionsFromDOM();

      setTimeout(() => {
        setIsEditMode(false);
      }, 100);
    }
  }, [isEditMode, setIsEditMode, syncPositionsFromDOM]);

  const setupEventListeners = useCallback(
    (grid: GridStack) => {
      if (!isEditMode) return;

      grid.off("dragstart resizestart dragstop resizestop drag resize change");

      logger.log(
        "GRIDSTACK",
        "Setting up event listeners for edit mode with container constraints"
      );

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

                try {
                  grid.update(element, constrained);
                } catch (error) {
                  logger.warn(
                    "GRIDSTACK",
                    `Error applying constraints to ${widgetId}`,
                    error
                  );

                  element.setAttribute("data-gs-x", constrained.x.toString());
                  element.setAttribute("data-gs-y", constrained.y.toString());
                  element.setAttribute("data-gs-w", constrained.w.toString());
                  element.setAttribute("data-gs-h", constrained.h.toString());
                }
              }

              const finalConstrained = constrainToContainer(
                node.x,
                node.y,
                node.w,
                node.h
              );

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

        setTimeout(() => {
          syncPositionsFromDOM();
        }, 100);
      });

      grid.on("drag resize", (event: any, element: any) => {
        const node = element.gridstackNode;
        if (
          node &&
          validators.isValidPosition(node.x, node.y, node.w, node.h)
        ) {
          const { MAX_WIDTH, MAX_HEIGHT } = WIDGET_CONFIG.CONTAINER;
          const widgetId = element.getAttribute("data-gs-id");

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

      grid.on("change", (event: any, items: any[]) => {
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

  const gridOptions = useMemo(
    () => ({
      cellHeight: WIDGET_CONFIG.GRID.CELL_HEIGHT,
      acceptWidgets: ".grid-stack-item",
      removable: false,
      staticGrid: !isEditMode,
      animate: true,
      float: true,
      column: WIDGET_CONFIG.CONTAINER.MAX_WIDTH,
      margin: WIDGET_CONFIG.GRID.MARGIN,
      minRow: WIDGET_CONFIG.CONTAINER.MIN_HEIGHT,
      maxRow: WIDGET_CONFIG.CONTAINER.MAX_HEIGHT,
      disableDrag: !isEditMode,
      disableResize: !isEditMode,
      resizable: {
        handles: "se",
        grid: [
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
        ],
      },
      verticalMargin: WIDGET_CONFIG.GRID.MARGIN,
      alwaysShowResizeHandle: isEditMode,
      minW: 1,
      maxW: WIDGET_CONFIG.CONTAINER.MAX_WIDTH,
      minH: 1,
      maxH: WIDGET_CONFIG.CONTAINER.MAX_HEIGHT,
      dragIn: ".grid-stack-item",
      dragInOptions: {
        revert: "invalid",
        scroll: false,
        appendTo: "body",
        helper: "clone",
        snap: true,
        snapMode: "both",
        snapTolerance: 10,
        grid: [
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
          WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN,
        ],
      },
      draggable: {
        handle: ".grid-stack-item-content",
        scroll: false,
        appendTo: "body",
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

        if (isEditMode) {
          const grid = gridInstance.current;

          setTimeout(() => {
            if (grid && (grid as any).opts) {
              (grid as any).opts.snapToGrid = true;
              (grid as any).opts.snapTolerance = 10;

              logger.log(
                "USEGRIDSTACK",
                "Snap-to-grid configurado en la instancia de GridStack"
              );
            }
          }, 100);
        }

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

  // Efecto separado para controlar la visibilidad de la grilla según el modo de edición
  useEffect(() => {
    if (!gridRef.current) return;

    if (isEditMode) {
      // Mostrar grilla en modo edición
      gridRef.current.style.backgroundImage = `
        linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
      `;
      gridRef.current.style.backgroundSize = `${
        ((WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN) /
          WIDGET_CONFIG.CONTAINER.MAX_WIDTH) *
        100
      }% ${WIDGET_CONFIG.GRID.CELL_HEIGHT + WIDGET_CONFIG.GRID.MARGIN}px`;

      logger.log("USEGRIDSTACK", "Grid lines enabled for edit mode");
    } else {
      // Ocultar grilla en modo normal
      gridRef.current.style.backgroundImage = "none";
      gridRef.current.style.backgroundSize = "auto";

      logger.log("USEGRIDSTACK", "Grid lines disabled for normal mode");
    }
  }, [isEditMode]);

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
