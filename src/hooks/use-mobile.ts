import { useEffect, useState, useCallback } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Inicialización lazy para evitar hydration mismatch
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Usar el callback optimizado
    mql.addEventListener("change", handleResize);

    // Verificación inicial
    handleResize();

    return () => mql.removeEventListener("change", handleResize);
  }, [handleResize]);

  return isMobile;
}
