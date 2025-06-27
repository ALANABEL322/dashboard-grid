import React, { useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
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

export const GridWidget: React.FC<GridWidgetProps> = ({
  widget,
  isEditMode,
  onToggleVisibility,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const { isDragging } = useGridStore();

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
    <div
      ref={widgetRef}
      className={`grid-stack-item ${!widget.visible ? "opacity-30" : ""}`}
      data-gs-w={widget.w}
      data-gs-h={widget.h}
      data-gs-x={widget.x}
      data-gs-y={widget.y}
      data-gs-id={widget.id}
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

        {!widget.visible && isEditMode && (
          <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center z-5">
            <div className="text-gray-500 text-sm font-medium">
              Widget Oculto
            </div>
          </div>
        )}

        <div
          className={`p-4 ${!widget.visible && isEditMode ? "opacity-50" : ""}`}
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {widget.title}
          </h3>
          <div className="text-gray-600">
            <WidgetContent widget={widget} />
          </div>
        </div>
      </div>
    </div>
  );
};
