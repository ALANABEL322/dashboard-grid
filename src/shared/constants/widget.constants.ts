export const WIDGET_CONFIG = {
  GRID: {
    CELL_HEIGHT: 70,
    COLUMNS: 6,
    MARGIN: 8,
    MIN_ROW: 1,
  },
  CONTAINER: {
    // Configuración del contenedor delimitado (pecera) - ALTURA DUPLICADA
    MIN_WIDTH: 6, // Ancho mínimo en columnas
    MAX_WIDTH: 6, // Ancho máximo en columnas
    MIN_HEIGHT: 12, // Altura mínima en filas
    MAX_HEIGHT: 40, // Altura máxima en filas (duplicada de 20 a 40)
    PADDING: 16, // Padding interno del contenedor
    BORDER_WIDTH: 2, // Ancho del borde del contenedor
    CONSTRAIN_TO_CONTAINER: true, // Forzar widgets dentro del contenedor
  },
  PAGINATION: {
    ITEMS_PER_PAGE: 5,
    DEFAULT_PAGE: 1,
  },
  ANIMATION: {
    HYDRATION_DELAY: 100,
    SYNC_DELAY: 50,
    PERSIST_DELAY: 100,
  },
} as const;

export const WIDGET_DEFAULTS = {
  POSITIONS: {
    "widget-1": { x: 0, y: 0, w: 6, h: 4 },
    "widget-2": { x: 0, y: 4, w: 3, h: 2 },
    "widget-3": { x: 3, y: 4, w: 3, h: 2 },
    "widget-4": { x: 0, y: 6, w: 3, h: 3 },
    "widget-5": { x: 3, y: 6, w: 3, h: 3 },
  },
} as const;

export const WIDGET_NUMBERS: Record<string, number> = {
  "widget-1": 1,
  "widget-2": 2,
  "widget-3": 3,
  "widget-4": 4,
  "widget-5": 5,
} as const;

export const USER_TYPES = {
  VIP: "VIP",
  PREMIUM: "Premium",
  BASIC: "Básico",
} as const;

export const WIDGET_TYPES = {
  USER_TABLE: "user-table",
  USER_STATS: "user-stats",
  USER_ACTIVITY: "user-activity",
  USER_GROWTH: "user-growth",
  USER_LOCATIONS: "user-locations",
  CUSTOM: "custom",
} as const;

export const STORAGE_KEYS = {
  GRID_STORAGE: "grid-storage",
} as const;

export const CSS_CLASSES = {
  GRID: {
    CONTAINER: "grid-stack",
    STATIC: "grid-stack-static",
    ITEM: "grid-stack-item",
    CONTENT: "grid-stack-item-content",
  },
  WIDGET: {
    HIDDEN: "opacity-30",
    EYE_BUTTON: "eye-button",
    STATS_GRID: "widget-stats-grid",
    STAT_ITEM: "widget-stat-item",
    STAT_VALUE: "widget-stat-value",
    STAT_LABEL: "widget-stat-label",
    ACTIVITY_ITEM: "widget-activity-item",
    PROGRESS_BAR: "widget-progress-bar",
    PROGRESS_FILL: "widget-progress-fill",
  },
} as const;
