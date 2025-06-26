import React from "react";
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

export const UserStatsWidget: React.FC<UserStatsWidgetProps> = ({
  data,
  className,
}) => {
  const stats = [
    {
      key: "total",
      value: data.totalUsers.toLocaleString(),
      label: "Total Clientes",
      color: STAT_COLORS.total,
    },
    {
      key: "active",
      value: data.activeUsers.toLocaleString(),
      label: "Activos",
      color: STAT_COLORS.active,
    },
    {
      key: "new",
      value: data.newUsersToday,
      label: "Nuevos Hoy",
      color: STAT_COLORS.new,
    },
    {
      key: "admin",
      value: data.adminUsers,
      label: "VIP",
      color: STAT_COLORS.admin,
    },
  ];

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
};
