import React from "react";
import { UserActivityData, Activity } from "@/shared/types/widget.types";
import { cn } from "@/shared/utils/utils";

interface UserActivityWidgetProps {
  data: UserActivityData;
  className?: string;
}

const getActivityIcon = (action: string) => {
  if (action.includes("login") || action.includes("ingresó")) return "🔐";
  if (action.includes("compra") || action.includes("purchase")) return "🛒";
  if (action.includes("actualiz") || action.includes("update")) return "✏️";
  if (action.includes("mensaje") || action.includes("message")) return "💬";
  return "👤";
};

const getTimeAgo = (timeString: string) => {
  return timeString;
};

export const UserActivityWidget: React.FC<UserActivityWidgetProps> = ({
  data,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {data.activities.map((activity: Activity, index: number) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-sm">
            {getActivityIcon(activity.action)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {activity.user}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {activity.action}
                </p>
              </div>

              <span className="flex-shrink-0 text-xs text-gray-500 font-medium">
                {getTimeAgo(activity.time)}
              </span>
            </div>
          </div>
        </div>
      ))}

      {data.activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm">No hay actividad reciente</p>
        </div>
      )}
    </div>
  );
};
