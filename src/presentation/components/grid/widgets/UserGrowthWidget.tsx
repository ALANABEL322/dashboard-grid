import React from "react";
import { UserGrowthData, MonthlyData } from "@/shared/types/widget.types";
import { cn } from "@/shared/utils/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface UserGrowthWidgetProps {
  data: UserGrowthData;
  className?: string;
}

const SimpleBarChart: React.FC<{ data: MonthlyData[] }> = ({ data }) => {
  const maxUsers = Math.max(...data.map((d) => d.users));

  return (
    <div className="flex items-end gap-1 h-20 mt-4">
      {data.map((month, index) => {
        const height = (month.users / maxUsers) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
              style={{ height: `${height}%` }}
              title={`${month.month}: ${month.users} usuarios`}
            />
            <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
              {month.month.slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const UserGrowthWidget: React.FC<UserGrowthWidgetProps> = ({
  data,
  className,
}) => {
  const isPositiveGrowth = data.percentage >= 0;
  const recentMonths = data.monthly.slice(-6);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isPositiveGrowth ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span
              className={cn(
                "text-2xl font-bold",
                isPositiveGrowth ? "text-green-600" : "text-red-600"
              )}
            >
              {isPositiveGrowth ? "+" : ""}
              {data.percentage}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Crecimiento mensual</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {data.monthly[data.monthly.length - 1]?.users.toLocaleString() ||
              "0"}
          </p>
          <p className="text-xs text-gray-500">Este mes</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Últimos 6 meses
        </h4>
        <SimpleBarChart data={recentMonths} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-blue-900">
            {Math.max(...data.monthly.map((m) => m.users)).toLocaleString()}
          </p>
          <p className="text-xs text-blue-600">Pico máximo</p>
        </div>

        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-green-900">
            {Math.round(
              data.monthly.reduce((acc, m) => acc + m.users, 0) /
                data.monthly.length
            ).toLocaleString()}
          </p>
          <p className="text-xs text-green-600">Promedio</p>
        </div>
      </div>
    </div>
  );
};
