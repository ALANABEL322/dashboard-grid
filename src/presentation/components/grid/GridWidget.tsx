import React, { useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGridStore, type GridWidgetData } from "../../stores/gridStore";

interface GridWidgetProps {
  widget: GridWidgetData;
  isEditMode: boolean;
  onToggleVisibility: (id: string) => void;
}

const WidgetContent: React.FC<{ widget: GridWidgetData }> = ({ widget }) => {
  switch (widget.type) {
    case "analytics":
      return (
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {widget.data.value}
          </p>
          <p className="text-sm text-gray-500">{widget.data.label}</p>
        </div>
      );

    case "revenue":
      return (
        <div>
          <p className="text-2xl font-bold text-green-600">
            {widget.data.value}
          </p>
          <p className="text-sm text-gray-500">{widget.data.label}</p>
        </div>
      );

    case "activity":
      return (
        <div>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${widget.data.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {widget.data.percentage}% {widget.data.label}
            </p>
          </div>
        </div>
      );

    case "orders":
      return (
        <div className="space-y-2">
          {widget.data.orders.map((order: any, index: number) => (
            <div key={index} className="text-sm">
              <p className="font-medium">Order {order.id}</p>
              <p className="text-gray-500">{order.amount}</p>
            </div>
          ))}
        </div>
      );

    case "stats":
      return (
        <div className="grid grid-cols-2 gap-4">
          {widget.data.stats.map((stat: any, index: number) => (
            <div key={index} className="text-center">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      );

    case "custom":
    default:
      return (
        <div>
          <p className="text-gray-600">
            {widget.data.message || "Custom widget content"}
          </p>
        </div>
      );
  }
};

export const GridWidget: React.FC<GridWidgetProps> = ({
  widget,
  isEditMode,
  onToggleVisibility,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const { isDragging, draggedWidgetId } = useGridStore();

  // Efecto para sincronizar posiciones solo cuando NO se está arrastrando
  useEffect(() => {
    const element = widgetRef.current;
    if (!element) return;

    // Solo actualizar si no estamos en una interacción activa
    if (!isDragging) {
      // Verificar si realmente necesitamos actualizar
      const currentX = element.getAttribute("data-gs-x");
      const currentY = element.getAttribute("data-gs-y");
      const currentW = element.getAttribute("data-gs-w");
      const currentH = element.getAttribute("data-gs-h");

      // Solo actualizar si hay diferencias reales
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
    }
  }, [widget.x, widget.y, widget.w, widget.h, isDragging, widget.id]);

  // En modo vista, no renderizar widgets ocultos
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
      style={{
        display: !widget.visible && !isEditMode ? "none" : "block",
      }}
    >
      <div
        className={`grid-stack-item-content bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden relative ${
          !widget.visible ? "border-dashed border-gray-400 bg-gray-50" : ""
        }`}
      >
        {/* Botón de visibilidad en modo edición */}
        {isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 z-10 h-6 w-6 shadow-sm eye-button ${
              widget.visible
                ? "bg-white/80 hover:bg-white text-gray-700"
                : "bg-red-100/80 hover:bg-red-200 text-red-600"
            }`}
            onClick={(e) => {
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

        {/* Overlay para widgets ocultos */}
        {!widget.visible && isEditMode && (
          <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center z-5">
            <div className="text-gray-500 text-sm font-medium">
              Widget Oculto
            </div>
          </div>
        )}

        {/* Contenido del widget */}
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

        {/* Indicador de modo edición */}
        {isEditMode && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            📝 Editando
          </div>
        )}
      </div>
    </div>
  );
};
