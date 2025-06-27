import React, { useMemo } from "react";
import { UserStatsData } from "@/shared/types/widget.types";
import { CSS_CLASSES } from "@/shared/constants/widget.constants";
import { cn } from "@/shared/utils/utils";

interface UserStatsWidgetProps {
  data: UserStatsData;
  className?: string;
}

const STAT_COLORS = {
  total: "text-blue-600",
  active: "text-green-600",
  new: "text-purple-600",
  admin: "text-orange-600",
} as const;

export function UserStatsWidget({ data, className }: UserStatsWidgetProps) {
  // Memoizar cálculos para optimizar performance
  const stats = useMemo(() => {
    // Validar data
    if (!data || typeof data !== "object") {
      return null;
    }

    return [
      {
        key: "total",
        value: (data.totalUsers || 0).toLocaleString(),
        label: "Total Clientes",
        color: STAT_COLORS.total,
      },
      {
        key: "active",
        value: (data.activeUsers || 0).toLocaleString(),
        label: "Activos",
        color: STAT_COLORS.active,
      },
      {
        key: "new",
        value: (data.newUsersToday || 0).toString(),
        label: "Nuevos Hoy",
        color: STAT_COLORS.new,
      },
      {
        key: "admin",
        value: (data.adminUsers || 0).toString(),
        label: "VIP",
        color: STAT_COLORS.admin,
      },
    ];
  }, [data]);

  // Early return para datos inválidos
  if (!stats) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-gray-500">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm">No hay datos estadísticos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(CSS_CLASSES.WIDGET.STATS_GRID, className)}>
      {stats.map((stat) => (
        <div key={stat.key} className={CSS_CLASSES.WIDGET.STAT_ITEM}>
          <p className={cn(CSS_CLASSES.WIDGET.STAT_VALUE, stat.color)}>
            {stat.value}
          </p>
          <p className={CSS_CLASSES.WIDGET.STAT_LABEL}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
