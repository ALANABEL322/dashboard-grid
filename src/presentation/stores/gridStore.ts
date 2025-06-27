import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GridWidgetData } from "@/shared/types/widget.types";
import { logger, validators } from "@/shared/utils/utils";

export type { GridWidgetData } from "@/shared/types/widget.types";

const mockUsers = [
  { id: 1, name: "Ana García", email: "ana@empresa.com", type: "VIP" as const },
  {
    id: 2,
    name: "Carlos López",
    email: "carlos@empresa.com",
    type: "Premium" as const,
  },
  {
    id: 3,
    name: "María Rodríguez",
    email: "maria@empresa.com",
    type: "Básico" as const,
  },
  {
    id: 4,
    name: "Juan Martínez",
    email: "juan@empresa.com",
    type: "VIP" as const,
  },
  {
    id: 5,
    name: "Laura Sánchez",
    email: "laura@empresa.com",
    type: "Premium" as const,
  },
  {
    id: 6,
    name: "Pedro Gómez",
    email: "pedro@empresa.com",
    type: "Básico" as const,
  },
  {
    id: 7,
    name: "Sofia Herrera",
    email: "sofia@empresa.com",
    type: "VIP" as const,
  },
  {
    id: 8,
    name: "Diego Torres",
    email: "diego@empresa.com",
    type: "Premium" as const,
  },
  {
    id: 9,
    name: "Elena Vargas",
    email: "elena@empresa.com",
    type: "Básico" as const,
  },
  {
    id: 10,
    name: "Roberto Silva",
    email: "roberto@empresa.com",
    type: "VIP" as const,
  },
  {
    id: 11,
    name: "Carmen Ruiz",
    email: "carmen@empresa.com",
    type: "Premium" as const,
  },
  {
    id: 12,
    name: "Miguel Torres",
    email: "miguel@empresa.com",
    type: "Básico" as const,
  },
  {
    id: 13,
    name: "Patricia Vega",
    email: "patricia@empresa.com",
    type: "VIP" as const,
  },
  {
    id: 14,
    name: "Fernando Castro",
    email: "fernando@empresa.com",
    type: "Premium" as const,
  },
  {
    id: 15,
    name: "Gabriela Mendoza",
    email: "gabriela@empresa.com",
    type: "Básico" as const,
  },
  {
    id: 16,
    name: "Andrés Romero",
    email: "andres@empresa.com",
    type: "VIP" as const,
  },
  {
    id: 17,
    name: "Valeria Guerrero",
    email: "valeria@empresa.com",
    type: "Premium" as const,
  },
  {
    id: 18,
    name: "Javier Delgado",
    email: "javier@empresa.com",
    type: "Básico" as const,
  },
  {
    id: 19,
    name: "Natalia Vargas",
    email: "natalia@empresa.com",
    type: "VIP" as const,
  },
  {
    id: 20,
    name: "Ricardo Flores",
    email: "ricardo@empresa.com",
    type: "Premium" as const,
  },
];

const mockActivities = [
  { user: "Ana García", action: "Inició sesión", time: "Hace 5 min" },
  { user: "Carlos López", action: "Actualizó perfil", time: "Hace 12 min" },
  { user: "María Rodríguez", action: "Realizó compra", time: "Hace 1 hora" },
  { user: "Juan Martínez", action: "Descargó reporte", time: "Hace 2 horas" },
  { user: "Laura Sánchez", action: "Cambió contraseña", time: "Hace 3 horas" },
];

const mockGrowthData = [
  { month: "Ene", users: 120 },
  { month: "Feb", users: 145 },
  { month: "Mar", users: 180 },
  { month: "Abr", users: 220 },
  { month: "May", users: 280 },
  { month: "Jun", users: 350 },
];

interface GridState {
  widgets: GridWidgetData[];
  isDragging: boolean;
  draggedWidgetId: string | null;
  widgetPagination: { [widgetId: string]: number };

  setWidgets: (widgets: GridWidgetData[]) => void;
  updateWidget: (id: string, updates: Partial<GridWidgetData>) => void;
  updateWidgetPosition: (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
  toggleWidgetVisibility: (id: string) => void;
  setDragging: (isDragging: boolean, widgetId?: string) => void;
  restoreAllWidgets: () => void;
  resetToDefaults: () => void;
  setWidgetPage: (widgetId: string, page: number) => void;
  getWidgetPage: (widgetId: string) => number;
  syncPositionsFromDOM: () => void;
  saveCurrentLayout: () => void;
}

const initialWidgets: GridWidgetData[] = [
  {
    id: "widget-1",
    title: "Clientes Registrados",
    type: "user-table",
    data: {
      users: [
        {
          id: 1,
          name: "Juan Pérez",
          email: "juan.perez@example.com",
          type: "Premium",
        },
        {
          id: 2,
          name: "María García",
          email: "maria.garcia@example.com",
          type: "Básico",
        },
        {
          id: 3,
          name: "Carlos López",
          email: "carlos.lopez@example.com",
          type: "Premium",
        },
        {
          id: 4,
          name: "Ana Martínez",
          email: "ana.martinez@example.com",
          type: "Básico",
        },
        {
          id: 5,
          name: "Luis Rodríguez",
          email: "luis.rodriguez@example.com",
          type: "VIP",
        },
        {
          id: 6,
          name: "Carmen Ruiz",
          email: "carmen.ruiz@example.com",
          type: "Premium",
        },
        {
          id: 7,
          name: "Miguel Torres",
          email: "miguel.torres@example.com",
          type: "Básico",
        },
        {
          id: 8,
          name: "Laura Sánchez",
          email: "laura.sanchez@example.com",
          type: "VIP",
        },
        {
          id: 9,
          name: "Diego Morales",
          email: "diego.morales@example.com",
          type: "Premium",
        },
        {
          id: 10,
          name: "Sofía Jiménez",
          email: "sofia.jimenez@example.com",
          type: "Básico",
        },
        {
          id: 11,
          name: "Roberto Herrera",
          email: "roberto.herrera@example.com",
          type: "Premium",
        },
        {
          id: 12,
          name: "Patricia Vega",
          email: "patricia.vega@example.com",
          type: "VIP",
        },
        {
          id: 13,
          name: "Fernando Castro",
          email: "fernando.castro@example.com",
          type: "Básico",
        },
        {
          id: 14,
          name: "Gabriela Mendoza",
          email: "gabriela.mendoza@example.com",
          type: "Premium",
        },
        {
          id: 15,
          name: "Andrés Romero",
          email: "andres.romero@example.com",
          type: "VIP",
        },
        {
          id: 16,
          name: "Valeria Guerrero",
          email: "valeria.guerrero@example.com",
          type: "Básico",
        },
        {
          id: 17,
          name: "Javier Delgado",
          email: "javier.delgado@example.com",
          type: "Premium",
        },
        {
          id: 18,
          name: "Natalia Vargas",
          email: "natalia.vargas@example.com",
          type: "VIP",
        },
        {
          id: 19,
          name: "Ricardo Flores",
          email: "ricardo.flores@example.com",
          type: "Básico",
        },
        {
          id: 20,
          name: "Isabella Cruz",
          email: "isabella.cruz@example.com",
          type: "Premium",
        },
        {
          id: 21,
          name: "Alejandro Reyes",
          email: "alejandro.reyes@example.com",
          type: "VIP",
        },
        {
          id: 22,
          name: "Camila Ortiz",
          email: "camila.ortiz@example.com",
          type: "Básico",
        },
        {
          id: 23,
          name: "Sebastián Ramos",
          email: "sebastian.ramos@example.com",
          type: "Premium",
        },
        {
          id: 24,
          name: "Daniela Silva",
          email: "daniela.silva@example.com",
          type: "VIP",
        },
        {
          id: 25,
          name: "Mateo Aguilar",
          email: "mateo.aguilar@example.com",
          type: "Básico",
        },
        {
          id: 26,
          name: "Valentina Moreno",
          email: "valentina.moreno@example.com",
          type: "Premium",
        },
        {
          id: 27,
          name: "Emilio Paredes",
          email: "emilio.paredes@example.com",
          type: "VIP",
        },
        {
          id: 28,
          name: "Lucía Espinoza",
          email: "lucia.espinoza@example.com",
          type: "Básico",
        },
        {
          id: 29,
          name: "Joaquín Navarro",
          email: "joaquin.navarro@example.com",
          type: "Premium",
        },
      ],
    },
    visible: true,
    x: 0,
    y: 0,
    w: 6,
    h: 4,
  },
  {
    id: "widget-2",
    title: "Estadísticas de Clientes",
    type: "user-stats",
    data: {
      totalUsers: 1247,
      activeUsers: 892,
      newUsersToday: 23,
      adminUsers: 12,
    },
    visible: true,
    x: 0,
    y: 4,
    w: 3,
    h: 2,
  },
  {
    id: "widget-3",
    title: "Actividad de Clientes",
    type: "user-activity",
    data: {
      activities: [
        { user: "Juan Pérez", action: "Compra realizada", time: "Hace 5 min" },
        {
          user: "María García",
          action: "Actualización de perfil",
          time: "Hace 12 min",
        },
        {
          user: "Carlos López",
          action: "Consulta de soporte",
          time: "Hace 1 hora",
        },
        {
          user: "Ana Martínez",
          action: "Renovación de plan",
          time: "Hace 2 horas",
        },
      ],
    },
    visible: true,
    x: 3,
    y: 4,
    w: 3,
    h: 2,
  },
  {
    id: "widget-4",
    title: "Crecimiento de Clientes",
    type: "user-growth",
    data: {
      monthly: [
        { month: "Enero", users: 89 },
        { month: "Febrero", users: 127 },
        { month: "Marzo", users: 156 },
        { month: "Abril", users: 203 },
        { month: "Mayo", users: 178 },
        { month: "Junio", users: 234 },
      ],
      percentage: 23.5,
    },
    visible: true,
    x: 0,
    y: 6,
    w: 3,
    h: 3,
  },
  {
    id: "widget-5",
    title: "Ubicaciones de Clientes",
    type: "user-locations",
    data: {
      locations: [
        { country: "México", users: 456, percentage: 36.6 },
        { country: "España", users: 289, percentage: 23.2 },
        { country: "Argentina", users: 234, percentage: 18.8 },
        { country: "Colombia", users: 156, percentage: 12.5 },
        { country: "Otros", users: 112, percentage: 8.9 },
      ],
    },
    visible: true,
    x: 3,
    y: 6,
    w: 3,
    h: 3,
  },
];

console.log(
  "[STORE] Initializing store with initial widgets:",
  initialWidgets.map((w) => ({
    id: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    visible: w.visible,
  }))
);

console.log("[STORE] Creating store with persist middleware");

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      widgets: initialWidgets,
      isDragging: false,
      draggedWidgetId: null,
      widgetPagination: {},

      setWidgets: (widgets) => {
        console.log("[STORE] setWidgets called");
        set({ widgets });
      },

      updateWidget: (id, updates) => {
        console.log(`[STORE] updateWidget - ID: ${id}`, updates);
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, ...updates } : widget
          ),
        }));
      },

      updateWidgetPosition: (id, x, y, w, h) => {
        console.log(`[STORE] updateWidgetPosition - ID: ${id}`, { x, y, w, h });
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, x, y, w, h } : widget
          ),
        }));

        setTimeout(() => {
          const stored = localStorage.getItem("grid-storage");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const updatedWidget = parsed.state?.widgets?.find(
                (w: any) => w.id === id
              );
              console.log(
                `[PERSIST] Widget ${id} in localStorage:`,
                updatedWidget
                  ? {
                      x: updatedWidget.x,
                      y: updatedWidget.y,
                      w: updatedWidget.w,
                      h: updatedWidget.h,
                    }
                  : "NOT FOUND"
              );
            } catch (error) {
              console.log(`[PERSIST] Error checking localStorage:`, error);
            }
          }
        }, 100);
      },

      toggleWidgetVisibility: (id) => {
        logger.log("STORE", `toggleWidgetVisibility - ID: ${id}`);

        const state = get();
        const widget = state.widgets.find((w) => w.id === id);

        if (!widget) {
          logger.warn("STORE", `Widget ${id} not found in store`);
          return;
        }

        if (widget.visible) {
          logger.log(
            "STORE",
            `Widget ${id} is being hidden, syncing position first`
          );

          if (typeof document !== "undefined") {
            const element = document.querySelector(`[data-gs-id="${id}"]`);
            if (element) {
              const node = (element as any).gridstackNode;
              let x, y, w, h;

              if (
                node &&
                validators.isValidPosition(node.x, node.y, node.w, node.h)
              ) {
                x = node.x;
                y = node.y;
                w = node.w;
                h = node.h;
                logger.log("STORE", `Using gridstackNode data for ${id}:`, {
                  x,
                  y,
                  w,
                  h,
                });
              } else {
                const xAttr = element.getAttribute("data-gs-x");
                const yAttr = element.getAttribute("data-gs-y");
                const wAttr = element.getAttribute("data-gs-w");
                const hAttr = element.getAttribute("data-gs-h");

                x = xAttr ? parseInt(xAttr, 10) : widget.x;
                y = yAttr ? parseInt(yAttr, 10) : widget.y;
                w = wAttr ? parseInt(wAttr, 10) : widget.w;
                h = hAttr ? parseInt(hAttr, 10) : widget.h;
                logger.log("STORE", `Using DOM attributes for ${id}:`, {
                  x,
                  y,
                  w,
                  h,
                });
              }

              if (validators.isValidPosition(x, y, w, h)) {
                logger.log(
                  "STORE",
                  `Syncing position for ${id} before hiding:`,
                  {
                    from: {
                      x: widget.x,
                      y: widget.y,
                      w: widget.w,
                      h: widget.h,
                    },
                    to: { x, y, w, h },
                  }
                );

                set((state) => ({
                  widgets: state.widgets.map((widget) =>
                    widget.id === id
                      ? { ...widget, x, y, w, h, visible: false }
                      : widget
                  ),
                }));
                return;
              }
            }
          }
        } else {
          logger.log(
            "STORE",
            `Widget ${id} is being shown, forcing position from store`
          );

          set((state) => ({
            widgets: state.widgets.map((w) =>
              w.id === id ? { ...w, visible: true } : w
            ),
          }));

          setTimeout(() => {
            if (typeof document !== "undefined") {
              const element = document.querySelector(`[data-gs-id="${id}"]`);
              if (element) {
                const grid = (window as any).gridInstance;
                if (grid) {
                  try {
                    grid.update(element, {
                      x: widget.x,
                      y: widget.y,
                      w: widget.w,
                      h: widget.h,
                    });
                    logger.log("STORE", `Forced GridStack update for ${id}`, {
                      x: widget.x,
                      y: widget.y,
                      w: widget.w,
                      h: widget.h,
                    });
                  } catch (error) {
                    logger.warn(
                      "STORE",
                      `Error forcing GridStack update for ${id}`,
                      error
                    );
                  }
                }
              }
            }
          }, 100);
          return;
        }

        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, visible: !widget.visible } : widget
          ),
        }));
      },

      setDragging: (isDragging, widgetId) => {
        console.log(
          `[STORE] setDragging - isDragging: ${isDragging}, widgetId: ${widgetId}`
        );
        set({ isDragging, draggedWidgetId: widgetId || null });
      },

      restoreAllWidgets: () => {
        console.log(
          `[STORE] restoreAllWidgets - Restoring visibility only, keeping saved positions`
        );
        set((state) => ({
          widgets: state.widgets.map((widget) => ({
            ...widget,
            visible: true,
          })),
        }));
      },

      resetToDefaults: () => {
        console.log("[STORE] resetToDefaults - Resetting to default widgets");
        set({
          widgets: initialWidgets,
          isDragging: false,
          draggedWidgetId: null,
          widgetPagination: {},
        });
      },

      setWidgetPage: (widgetId, page) => {
        set((state) => ({
          widgetPagination: {
            ...state.widgetPagination,
            [widgetId]: page,
          },
        }));
      },

      getWidgetPage: (widgetId) => {
        return get().widgetPagination[widgetId] || 1;
      },

      syncPositionsFromDOM: () => {
        console.log("[STORE] syncPositionsFromDOM - Starting sync from DOM");

        if (typeof document === "undefined") {
          console.warn("[STORE] DOM not available for sync");
          return;
        }

        const gridElements = document.querySelectorAll(".grid-stack-item");
        console.log(
          `[STORE] Found ${gridElements.length} grid elements in DOM`
        );

        const positionUpdates: {
          [id: string]: { x: number; y: number; w: number; h: number };
        } = {};

        gridElements.forEach((element) => {
          const widgetId = element.getAttribute("data-gs-id");
          if (widgetId) {
            const xAttr = element.getAttribute("data-gs-x");
            const yAttr = element.getAttribute("data-gs-y");
            const wAttr = element.getAttribute("data-gs-w");
            const hAttr = element.getAttribute("data-gs-h");

            const x = xAttr ? parseInt(xAttr, 10) : 0;
            const y = yAttr ? parseInt(yAttr, 10) : 0;
            const w = wAttr ? parseInt(wAttr, 10) : 1;
            const h = hAttr ? parseInt(hAttr, 10) : 1;

            if (!isNaN(x) && !isNaN(y) && !isNaN(w) && !isNaN(h)) {
              positionUpdates[widgetId] = { x, y, w, h };
              console.log(`[STORE] DOM position for ${widgetId}:`, {
                x,
                y,
                w,
                h,
              });
            } else {
              console.warn(`[STORE] Invalid position data for ${widgetId}`, {
                xAttr,
                yAttr,
                wAttr,
                hAttr,
              });
            }
          }
        });

        const state = get();
        const updatedWidgets = state.widgets.map((widget) => {
          const domPosition = positionUpdates[widget.id];
          if (domPosition) {
            const hasChanged =
              widget.x !== domPosition.x ||
              widget.y !== domPosition.y ||
              widget.w !== domPosition.w ||
              widget.h !== domPosition.h;

            if (hasChanged) {
              console.log(`[STORE] Widget ${widget.id} position changed:`, {
                from: { x: widget.x, y: widget.y, w: widget.w, h: widget.h },
                to: domPosition,
              });
              return { ...widget, ...domPosition };
            }
          }
          return widget;
        });

        set({ widgets: updatedWidgets });
        console.log("[STORE] syncPositionsFromDOM - Completed");
      },

      saveCurrentLayout: () => {
        console.log("[STORE] saveCurrentLayout - Manual save triggered");

        get().syncPositionsFromDOM();

        const finalState = get();
        console.log(
          "[STORE] Final layout to be persisted:",
          finalState.widgets.map((w) => ({
            id: w.id,
            x: w.x,
            y: w.y,
            w: w.w,
            h: w.h,
            visible: w.visible,
          }))
        );

        console.log(
          "[STORE] Layout saved successfully (Zustand persist will handle persistence)"
        );
      },
    }),
    {
      name: "grid-storage",
      onRehydrateStorage: () => {
        console.log("[PERSIST] Starting hydration from localStorage");
        return (state, error) => {
          if (error) {
            console.log("[PERSIST] Hydration error:", error);
          } else {
            console.log("[PERSIST] Hydration completed successfully");
            if (state) {
              const loadedWidgets = state.widgets?.map((w) => ({
                id: w.id,
                x: w.x,
                y: w.y,
                w: w.w,
                h: w.h,
                visible: w.visible,
              }));
              console.log("[PERSIST] Loaded widgets:", loadedWidgets);

              const hasChanges = loadedWidgets?.some((loaded) => {
                const initial = initialWidgets.find(
                  (init) => init.id === loaded.id
                );
                return (
                  initial &&
                  (loaded.x !== initial.x ||
                    loaded.y !== initial.y ||
                    loaded.w !== initial.w ||
                    loaded.h !== initial.h ||
                    loaded.visible !== initial.visible)
                );
              });

              console.log(
                hasChanges
                  ? "[PERSIST] ✅ CHANGES detected - loaded data differs from initial"
                  : "[PERSIST] ⚠️ NO CHANGES detected - loaded data matches initial positions"
              );
            } else {
              console.log("[PERSIST] No state loaded - using initial widgets");
            }
          }
        };
      },
    }
  )
);
