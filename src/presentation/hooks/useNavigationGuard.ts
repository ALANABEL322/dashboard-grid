import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGridStore } from "../stores/gridStore";

export const useNavigationGuard = (
  isEditMode: boolean,
  setIsEditMode: (mode: boolean) => void
) => {
  const navigate = useNavigate();
  const { saveLayout } = useGridStore();

  const safeNavigate = useCallback(
    (path: string) => {
      if (isEditMode) {
        // Si está en modo edición, guardar layout y salir del modo edición
        saveLayout();
        setIsEditMode(false);

        // Mostrar mensaje de confirmación
        const confirmed = window.confirm(
          "Has salido del modo edición y se ha guardado el layout automáticamente. ¿Deseas continuar con la navegación?"
        );

        if (confirmed) {
          navigate(path);
        }
      } else {
        // Navegación normal
        navigate(path);
      }
    },
    [isEditMode, setIsEditMode, saveLayout, navigate]
  );

  return { safeNavigate };
};
