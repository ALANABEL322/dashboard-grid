import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface GridState {
  widgets: GridWidgetData[];
  isDragging: boolean;
  draggedWidgetId: string | null;

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
  addWidget: (widget: GridWidgetData) => void;
  removeWidget: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  setDragging: (isDragging: boolean, widgetId?: string) => void;
  loadLayout: () => void;
  saveLayout: () => void;
}

const initialWidgets: GridWidgetData[] = [
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
];

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      widgets: initialWidgets,
      isDragging: false,
      draggedWidgetId: null,

      setWidgets: (widgets) => {
        set({ widgets });
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, ...updates } : widget
          ),
        }));
      },

      updateWidgetPosition: (id, x, y, w, h) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, x, y, w, h } : widget
          ),
        }));
      },

      addWidget: (widget) => {
        set((state) => ({
          widgets: [...state.widgets, widget],
        }));
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
        }));
      },

      toggleWidgetVisibility: (id) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, visible: !widget.visible } : widget
          ),
        }));
      },

      setDragging: (isDragging, widgetId) => {
        set({ isDragging, draggedWidgetId: widgetId || null });
      },

      loadLayout: () => {
        const savedLayout = localStorage.getItem("dashboard-layout");
        if (savedLayout) {
          try {
            const layout = JSON.parse(savedLayout);
            const state = get();
            const updatedWidgets = state.widgets.map((widget) => {
              const savedWidget = layout.find(
                (item: any) => item.id === widget.id
              );
              return savedWidget ? { ...widget, ...savedWidget } : widget;
            });
            set({ widgets: updatedWidgets });
          } catch (error) {
            console.error("Error loading layout:", error);
          }
        }
      },

      saveLayout: () => {
        const state = get();
        const layout = state.widgets.map((widget) => ({
          id: widget.id,
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h,
          visible: widget.visible,
        }));

        localStorage.setItem("dashboard-layout", JSON.stringify(layout));
        console.log("Layout saved:", layout);
      },
    }),
    {
      name: "grid-storage",
      partialize: (state) => ({
        widgets: state.widgets,
      }),
    }
  )
);
