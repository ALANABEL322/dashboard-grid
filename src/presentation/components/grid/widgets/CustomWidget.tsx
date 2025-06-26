import React from "react";
import { CustomWidgetData } from "@/shared/types/widget.types";
import { cn } from "@/shared/utils/utils";
import { Settings, Info, Star, Zap } from "lucide-react";

interface CustomWidgetProps {
  data: CustomWidgetData;
  className?: string;
}

const getCustomIcon = (type?: string) => {
  switch (type) {
    case "settings":
      return <Settings className="h-5 w-5" />;
    case "info":
      return <Info className="h-5 w-5" />;
    case "star":
      return <Star className="h-5 w-5" />;
    case "zap":
      return <Zap className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const getThemeStyles = (theme?: string) => {
  switch (theme) {
    case "success":
      return {
        container: "bg-green-50 border-green-200",
        icon: "text-green-600 bg-green-100",
        title: "text-green-900",
        text: "text-green-700",
      };
    case "warning":
      return {
        container: "bg-yellow-50 border-yellow-200",
        icon: "text-yellow-600 bg-yellow-100",
        title: "text-yellow-900",
        text: "text-yellow-700",
      };
    case "error":
      return {
        container: "bg-red-50 border-red-200",
        icon: "text-red-600 bg-red-100",
        title: "text-red-900",
        text: "text-red-700",
      };
    case "info":
    default:
      return {
        container: "bg-blue-50 border-blue-200",
        icon: "text-blue-600 bg-blue-100",
        title: "text-blue-900",
        text: "text-blue-700",
      };
  }
};

export const CustomWidget: React.FC<CustomWidgetProps> = ({
  data,
  className,
}) => {
  const theme = getThemeStyles(data.theme);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Contenido principal */}
      <div
        className={cn(
          "rounded-lg border p-4 transition-all duration-200",
          theme.container
        )}
      >
        {/* Header con icono */}
        {(data.icon || data.title) && (
          <div className="flex items-start gap-3 mb-3">
            {data.icon && (
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                  theme.icon
                )}
              >
                {getCustomIcon(data.icon)}
              </div>
            )}

            {data.title && (
              <div className="flex-1">
                <h3 className={cn("font-semibold text-lg", theme.title)}>
                  {data.title}
                </h3>
              </div>
            )}
          </div>
        )}

        {/* Mensaje principal */}
        {data.message && (
          <div className={cn("text-sm leading-relaxed", theme.text)}>
            {data.message}
          </div>
        )}

        {/* Lista de elementos si existe */}
        {data.items && data.items.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm p-2 rounded bg-white/50",
                  theme.text
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Métricas si existen */}
        {data.metrics && Object.keys(data.metrics).length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(data.metrics).map(([key, value]) => (
              <div key={key} className="bg-white/50 rounded-lg p-3 text-center">
                <p className={cn("text-lg font-bold", theme.title)}>
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                <p className={cn("text-xs capitalize", theme.text)}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Acción si existe */}
        {data.action && (
          <div className="mt-4 pt-3 border-t border-current/10">
            <button
              className={cn(
                "w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors",
                "bg-white/70 hover:bg-white/90",
                theme.text
              )}
              onClick={() => {
                if (data.action?.onClick) {
                  data.action.onClick();
                } else {
                  console.log("Custom widget action clicked");
                }
              }}
            >
              {data.action.label || "Acción"}
            </button>
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      {data.footer && (
        <div className="text-xs text-gray-500 text-center">{data.footer}</div>
      )}
    </div>
  );
};
