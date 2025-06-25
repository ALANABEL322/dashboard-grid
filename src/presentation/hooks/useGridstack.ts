import { useEffect, useRef, useState, useCallback } from "react";
import { GridStack } from "gridstack";
import type { GridStackWidget } from "gridstack";

export interface GridWidgetData {
  id: string;
  title: string;
  type: "analytics" | "revenue" | "activity" | "orders" | "stats" | "custom";
  data: any;
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const useGridstack = (isEditMode: boolean) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstance = useRef<GridStack | null>(null);
  const [widgets, setWidgets] = useState<GridWidgetData[]>([
    {
      id: "widget-1",
      title: "Analytics Overview",
      type: "analytics",
      data: {
        value: "2,543",
        label: "Total Visits",
      },
      visible: true,
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      id: "widget-2",
      title: "Revenue",
      type: "revenue",
      data: {
        value: "$12,847",
        label: "This Month",
      },
      visible: true,
      x: 2,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      id: "widget-3",
      title: "User Activity",
      type: "activity",
      data: {
        percentage: 75,
        label: "Active Users",
      },
      visible: true,
      x: 4,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      id: "widget-4",
      title: "Recent Orders",
      type: "orders",
      data: {
        orders: [
          { id: "#1234", amount: "$299.99" },
          { id: "#1235", amount: "$149.50" },
        ],
      },
      visible: true,
      x: 0,
      y: 2,
      w: 3,
      h: 3,
    },
    {
      id: "widget-5",
      title: "Quick Stats",
      type: "stats",
      data: {
        stats: [
          { label: "New Users", value: "142" },
          { label: "Uptime", value: "98%" },
        ],
      },
      visible: true,
      x: 3,
      y: 2,
      w: 3,
      h: 3,
    },
  ]);

  // Inicializar Gridstack
  useEffect(() => {
    if (!gridRef.current) return;

    // Limpiar instancia anterior si existe
    if (gridInstance.current) {
      try {
        gridInstance.current.destroy(false); // No remover el DOM
        gridInstance.current = null;
      } catch (error) {
        console.warn("Error destroying grid instance:", error);
        gridInstance.current = null;
      }
    }

    // Crear nueva instancia
    try {
      gridInstance.current = GridStack.init(
        {
          cellHeight: 70,
          acceptWidgets: true,
          removable: false,
          staticGrid: !isEditMode,
          animate: true,
          float: true,
          column: 6,
          margin: 8,
          minRow: 1,
          disableDrag: !isEditMode,
          disableResize: !isEditMode,
        },
        gridRef.current
      );

      // Event listeners para cambios
      if (isEditMode && gridInstance.current) {
        gridInstance.current.on("change", (event, items) => {
          if (items) {
            setWidgets((prevWidgets) =>
              prevWidgets.map((widget) => {
                const updatedItem = items.find((item) => item.id === widget.id);
                if (updatedItem) {
                  return {
                    ...widget,
                    x: updatedItem.x || 0,
                    y: updatedItem.y || 0,
                    w: updatedItem.w || 1,
                    h: updatedItem.h || 1,
                  };
                }
                return widget;
              })
            );
          }
        });
      }
    } catch (error) {
      console.error("Error initializing GridStack:", error);
    }

    return () => {
      if (gridInstance.current) {
        try {
          gridInstance.current.destroy(false); // No remover el DOM
          gridInstance.current = null;
        } catch (error) {
          console.warn("Error in cleanup:", error);
          gridInstance.current = null;
        }
      }
    };
  }, [isEditMode]);

  // Función para alternar visibilidad
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setWidgets((prevWidgets) => {
      const newWidgets = prevWidgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, visible: !widget.visible }
          : widget
      );

      // Compactar el grid después de cambiar la visibilidad
      setTimeout(() => {
        if (gridInstance.current) {
          gridInstance.current.compact();
        }
      }, 50);

      return newWidgets;
    });
  }, []);

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

    setWidgets((prev) => [...prev, newWidget]);
  }, []);

  // Función para eliminar widget
  const removeWidget = useCallback((widgetId: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
  }, []);

  // Función para guardar layout
  const saveLayout = useCallback(() => {
    setWidgets((currentWidgets) => {
      const layout = currentWidgets.map((widget) => ({
        id: widget.id,
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
        visible: widget.visible,
      }));

      localStorage.setItem("dashboard-layout", JSON.stringify(layout));
      console.log("Layout saved:", layout);
      return currentWidgets; // No cambiar el estado
    });
  }, []);

  // Función para cargar layout
  const loadLayout = useCallback(() => {
    const savedLayout = localStorage.getItem("dashboard-layout");
    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        setWidgets((prevWidgets) =>
          prevWidgets.map((widget) => {
            const savedWidget = layout.find(
              (item: any) => item.id === widget.id
            );
            return savedWidget ? { ...widget, ...savedWidget } : widget;
          })
        );
      } catch (error) {
        console.error("Error loading layout:", error);
      }
    }
  }, []);

  return {
    gridRef,
    widgets,
    toggleWidgetVisibility,
    addWidget,
    removeWidget,
    saveLayout,
    loadLayout,
  };
};
