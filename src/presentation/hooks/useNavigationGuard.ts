import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGridStore } from "../stores/gridStore";
import { ProjectAlerts } from "@/shared/utils/sweetAlert";

export const useNavigationGuard = (
  isEditMode: boolean,
  setIsEditMode: (mode: boolean) => void
) => {
  const navigate = useNavigate();
  const { saveCurrentLayout } = useGridStore();

  const safeNavigate = useCallback(
    async (path: string) => {
      if (isEditMode) {
        saveCurrentLayout();
        setIsEditMode(false);

        const result = await ProjectAlerts.navigationConfirm();

        if (result.isConfirmed) {
          navigate(path);
        }
      } else {
        navigate(path);
      }
    },
    [isEditMode, setIsEditMode, saveCurrentLayout, navigate]
  );

  return { safeNavigate };
};
