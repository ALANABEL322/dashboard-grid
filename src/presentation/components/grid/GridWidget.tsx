import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useGridStore, type GridWidgetData } from "../../stores/gridStore";
import {
  UserStatsWidget,
  UserTableWidget,
  UserActivityWidget,
  UserGrowthWidget,
  UserLocationsWidget,
  CustomWidget,
} from "./widgets";

interface GridWidgetProps {
  widget: GridWidgetData;
  isEditMode: boolean;
  onToggleVisibility: (id: string) => void;
  onRemoveWidget: (id: string) => void;
}

const WidgetContent: React.FC<{ widget: GridWidgetData }> = ({ widget }) => {
  const { setWidgetPage, getWidgetPage } = useGridStore();
  const currentPage = getWidgetPage(widget.id);

  switch (widget.type) {
    case "user-table":
      return (
        <UserTableWidget
          data={widget.data as any}
          currentPage={currentPage}
          onPageChange={(page) => setWidgetPage(widget.id, page)}
        />
      );

    case "user-stats":
      return <UserStatsWidget data={widget.data as any} />;

    case "user-activity":
      return <UserActivityWidget data={widget.data as any} />;

    case "user-growth":
      return <UserGrowthWidget data={widget.data as any} />;

    case "user-locations":
      return <UserLocationsWidget data={widget.data as any} />;

    case "custom":
    default:
      return <CustomWidget data={widget.data as any} />;
  }
};

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  widgetTitle: string;
}> = ({ isOpen, onClose, onConfirm, widgetTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Eliminar Widget
            </h3>
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          ¿Estás seguro de que quieres eliminar el widget{" "}
          <strong>"{widgetTitle}"</strong>? Esta acción eliminará
          permanentemente el widget y toda su configuración.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-4 py-2">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700"
          >
            Eliminar Widget
          </Button>
        </div>
      </div>
    </div>
  );
};

export const GridWidget: React.FC<GridWidgetProps> = ({
  widget,
  isEditMode,
  onToggleVisibility,
  onRemoveWidget,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const { isDragging } = useGridStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getWidgetNumber = (widgetId: string) => {
    const widgetNumbers: { [key: string]: number } = {
      "widget-1": 1,
      "widget-2": 2,
      "widget-3": 3,
      "widget-4": 4,
      "widget-5": 5,
    };
    return widgetNumbers[widgetId] || 0;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onRemoveWidget(widget.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  useEffect(() => {
    const element = widgetRef.current;
    if (!element) return;

    const currentX = element.getAttribute("data-gs-x");
    const currentY = element.getAttribute("data-gs-y");
    const currentW = element.getAttribute("data-gs-w");
    const currentH = element.getAttribute("data-gs-h");

    if (
      currentX !== widget.x.toString() ||
      currentY !== widget.y.toString() ||
      currentW !== widget.w.toString() ||
      currentH !== widget.h.toString()
    ) {
      element.setAttribute("data-gs-x", widget.x.toString());
      element.setAttribute("data-gs-y", widget.y.toString());
      element.setAttribute("data-gs-w", widget.w.toString());
      element.setAttribute("data-gs-h", widget.h.toString());
    }
  }, [widget.x, widget.y, widget.w, widget.h]);

  if (!widget.visible && !isEditMode) {
    return null;
  }

  return (
    <>
      <div
        ref={widgetRef}
        className={`grid-stack-item ${!widget.visible ? "opacity-30" : ""}`}
        data-gs-w={widget.w}
        data-gs-h={widget.h}
        data-gs-x={widget.x}
        data-gs-y={widget.y}
        data-gs-id={widget.id}
        style={{
          display: !widget.visible && !isEditMode ? "none" : "block",
        }}
      >
        <div
          className={`grid-stack-item-content bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden relative ${
            !widget.visible ? "border-dashed border-gray-400 bg-gray-50" : ""
          }`}
        >
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 z-10 h-6 w-6 shadow-sm eye-button ${
                widget.visible
                  ? "bg-white/80 hover:bg-white text-gray-700"
                  : "bg-red-100/80 hover:bg-red-200 text-red-600"
              }`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onToggleVisibility(widget.id);
              }}
              title={widget.visible ? "Ocultar widget" : "Mostrar widget"}
            >
              {widget.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
          )}

          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-10 right-2 z-10 h-6 w-6 shadow-sm bg-red-100/80 hover:bg-red-200 text-red-600"
              onClick={handleDeleteClick}
              title="Eliminar widget"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}

          {!widget.visible && isEditMode && (
            <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center z-5">
              <div className="text-gray-500 text-sm font-medium">
                Widget Oculto
              </div>
            </div>
          )}

          <div
            className={`p-4 ${
              !widget.visible && isEditMode ? "opacity-50" : ""
            }`}
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {widget.title}
            </h3>
            <div className="text-gray-600">
              <WidgetContent widget={widget} />
            </div>
          </div>

          {isEditMode && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                📝 Editando
              </div>
              <div className="text-xs font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded-full min-w-[20px] text-center">
                {getWidgetNumber(widget.id)}
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        widgetTitle={widget.title}
      />
    </>
  );
};
