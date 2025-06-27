import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (tag: string, message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[${tag}] ${message}`, data || "");
    }
  },
  warn: (tag: string, message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[${tag}] ${message}`, data || "");
    }
  },
  error: (tag: string, message: string, data?: any) => {
    if (isDevelopment) {
      console.error(`[${tag}] ${message}`, data || "");
    }
  },
  group: (tag: string, title: string, fn: () => void) => {
    if (isDevelopment) {
      console.group(`[${tag}] ${title}`);
      fn();
      console.groupEnd();
    }
  },
};

export const validators = {
  isValidPosition: (x: number, y: number, w: number, h: number): boolean => {
    return (
      typeof x === "number" &&
      x >= 0 &&
      typeof y === "number" &&
      y >= 0 &&
      typeof w === "number" &&
      w > 0 &&
      typeof h === "number" &&
      h > 0 &&
      !isNaN(x) &&
      !isNaN(y) &&
      !isNaN(w) &&
      !isNaN(h)
    );
  },

  isValidWidgetId: (id: string): boolean => {
    return typeof id === "string" && id.length > 0;
  },

  sanitizePosition: (x: number, y: number, w: number, h: number) => {
    return {
      x: Math.max(0, Math.floor(x) || 0),
      y: Math.max(0, Math.floor(y) || 0),
      w: Math.max(1, Math.floor(w) || 1),
      h: Math.max(1, Math.floor(h) || 1),
    };
  },
};

export const performance = {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};
