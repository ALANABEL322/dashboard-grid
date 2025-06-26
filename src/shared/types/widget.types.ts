export type WidgetType =
  | "user-table"
  | "user-stats"
  | "user-activity"
  | "user-growth"
  | "user-locations"
  | "custom";

export interface User {
  id: number;
  name: string;
  email: string;
  type: "VIP" | "Premium" | "Básico";
}

export interface Activity {
  user: string;
  action: string;
  time: string;
}

export interface MonthlyData {
  month: string;
  users: number;
}

export interface LocationData {
  country: string;
  users: number;
  percentage: number;
}

export interface UserStatsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  adminUsers: number;
}

export interface UserGrowthData {
  monthly: MonthlyData[];
  percentage: number;
}

export interface UserActivityData {
  activities: Activity[];
}

export interface UserLocationsData {
  locations: LocationData[];
}

export interface UserTableData {
  users: User[];
}

export interface CustomWidgetData {
  message?: string;
  title?: string;
  icon?: "settings" | "info" | "star" | "zap";
  theme?: "success" | "warning" | "error" | "info";
  items?: string[];
  metrics?: Record<string, string | number>;
  action?: {
    label: string;
    onClick?: () => void;
  };
  footer?: string;
}

export type WidgetData =
  | UserTableData
  | UserStatsData
  | UserActivityData
  | UserGrowthData
  | UserLocationsData
  | CustomWidgetData;

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridWidgetData extends GridPosition {
  id: string;
  title: string;
  type: WidgetType;
  data: WidgetData;
  visible: boolean;
}

export interface WidgetProps {
  widget: GridWidgetData;
  isEditMode: boolean;
  onToggleVisibility: (id: string) => void;
  onRemoveWidget: (id: string) => void;
}

export interface GridState {
  widgets: GridWidgetData[];
  isDragging: boolean;
  draggedWidgetId: string | null;
  widgetPagination: Record<string, number>;
}

export interface GridActions {
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

export type GridStore = GridState & GridActions;
