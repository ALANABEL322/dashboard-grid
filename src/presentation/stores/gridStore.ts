import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GridWidgetData {
  id: string;
  title: string;
  type:
    | "user-table"
    | "user-stats"
    | "user-activity"
    | "user-growth"
    | "user-locations"
    | "custom";
  data: any;
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GridState {
  widgets: GridWidgetData[];
  isDragging: boolean;
  draggedWidgetId: string | null;
  widgetPagination: { [widgetId: string]: number };

  // Actions
  setWidgets: (widgets: GridWidgetData[]) => void;
  updateWidget: (id: string, updates: Partial<GridWidgetData>) => void;
  updateWidgetPosition: (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
  removeWidget: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  setDragging: (isDragging: boolean, widgetId?: string) => void;
  restoreAllWidgets: () => void;
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
        {
          id: 30,
          name: "Renata Campos",
          email: "renata.campos@example.com",
          type: "VIP",
        },
        {
          id: 31,
          name: "Tomás Peña",
          email: "tomas.pena@example.com",
          type: "Básico",
        },
        {
          id: 32,
          name: "Ximena Rojas",
          email: "ximena.rojas@example.com",
          type: "Premium",
        },
        {
          id: 33,
          name: "Nicolás Herrera",
          email: "nicolas.herrera@example.com",
          type: "VIP",
        },
        {
          id: 34,
          name: "Antonella Vázquez",
          email: "antonella.vazquez@example.com",
          type: "Básico",
        },
        {
          id: 35,
          name: "Maximiliano Soto",
          email: "maximiliano.soto@example.com",
          type: "Premium",
        },
        {
          id: 36,
          name: "Constanza Ibarra",
          email: "constanza.ibarra@example.com",
          type: "VIP",
        },
        {
          id: 37,
          name: "Ignacio Molina",
          email: "ignacio.molina@example.com",
          type: "Básico",
        },
        {
          id: 38,
          name: "Florencia Cáceres",
          email: "florencia.caceres@example.com",
          type: "Premium",
        },
        {
          id: 39,
          name: "Benjamín Cortés",
          email: "benjamin.cortes@example.com",
          type: "VIP",
        },
        {
          id: 40,
          name: "Martina Pacheco",
          email: "martina.pacheco@example.com",
          type: "Básico",
        },
        {
          id: 41,
          name: "Agustín Sandoval",
          email: "agustin.sandoval@example.com",
          type: "Premium",
        },
        {
          id: 42,
          name: "Emilia Fuentes",
          email: "emilia.fuentes@example.com",
          type: "VIP",
        },
        {
          id: 43,
          name: "Thiago Ríos",
          email: "thiago.rios@example.com",
          type: "Básico",
        },
        {
          id: 44,
          name: "Julieta Méndez",
          email: "julieta.mendez@example.com",
          type: "Premium",
        },
        {
          id: 45,
          name: "Gael Núñez",
          email: "gael.nunez@example.com",
          type: "VIP",
        },
        {
          id: 46,
          name: "Catalina Salinas",
          email: "catalina.salinas@example.com",
          type: "Básico",
        },
        {
          id: 47,
          name: "Bruno Carrasco",
          email: "bruno.carrasco@example.com",
          type: "Premium",
        },
        {
          id: 48,
          name: "Amelia Figueroa",
          email: "amelia.figueroa@example.com",
          type: "VIP",
        },
        {
          id: 49,
          name: "Lautaro Bustos",
          email: "lautaro.bustos@example.com",
          type: "Básico",
        },
        {
          id: 50,
          name: "Regina Contreras",
          email: "regina.contreras@example.com",
          type: "Premium",
        },
        {
          id: 51,
          name: "Santino Muñoz",
          email: "santino.munoz@example.com",
          type: "VIP",
        },
        {
          id: 52,
          name: "Bianca Araya",
          email: "bianca.araya@example.com",
          type: "Básico",
        },
        {
          id: 53,
          name: "Enzo Pizarro",
          email: "enzo.pizarro@example.com",
          type: "Premium",
        },
        {
          id: 54,
          name: "Delfina Tapia",
          email: "delfina.tapia@example.com",
          type: "VIP",
        },
        {
          id: 55,
          name: "Matías Bravo",
          email: "matias.bravo@example.com",
          type: "Básico",
        },
        {
          id: 56,
          name: "Mía Gallardo",
          email: "mia.gallardo@example.com",
          type: "Premium",
        },
        {
          id: 57,
          name: "Damián Vera",
          email: "damian.vera@example.com",
          type: "VIP",
        },
        {
          id: 58,
          name: "Abril Moya",
          email: "abril.moya@example.com",
          type: "Básico",
        },
        {
          id: 59,
          name: "Julián Leiva",
          email: "julian.leiva@example.com",
          type: "Premium",
        },
        {
          id: 60,
          name: "Alma Castillo",
          email: "alma.castillo@example.com",
          type: "VIP",
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

// Logging para verificar el estado inicial
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

        // Verificar que se guardó en localStorage después de un delay
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

      removeWidget: (id) => {
        console.log(`[STORE] removeWidget - ID: ${id}`);
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
        }));
      },

      toggleWidgetVisibility: (id) => {
        console.log(`[STORE] toggleWidgetVisibility - ID: ${id}`);
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
        console.log(`[STORE] restoreAllWidgets - Restoring to initial state`);
        set({ widgets: initialWidgets });
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
            const x = parseInt(element.getAttribute("data-gs-x") || "0");
            const y = parseInt(element.getAttribute("data-gs-y") || "0");
            const w = parseInt(element.getAttribute("data-gs-w") || "1");
            const h = parseInt(element.getAttribute("data-gs-h") || "1");

            positionUpdates[widgetId] = { x, y, w, h };
            console.log(`[STORE] DOM position for ${widgetId}:`, {
              x,
              y,
              w,
              h,
            });
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

        // Primero sincronizar desde DOM
        get().syncPositionsFromDOM();

        // Mostrar estado final
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

              // Verificar si hay cambios
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
