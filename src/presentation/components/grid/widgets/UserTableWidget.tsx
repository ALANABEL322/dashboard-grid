import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { UserTableData, User } from "@/shared/types/widget.types";
import { WIDGET_CONFIG } from "@/shared/constants/widget.constants";
import { cn } from "@/shared/utils/utils";

interface UserTableWidgetProps {
  data: UserTableData;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const getUserTypeStyles = (type: User["type"]) => {
  const styles = {
    VIP: "bg-purple-100 text-purple-800",
    Premium: "bg-yellow-100 text-yellow-800",
    Básico: "bg-blue-100 text-blue-800",
  };
  return styles[type];
};

export const UserTableWidget: React.FC<UserTableWidgetProps> = ({
  data,
  currentPage,
  onPageChange,
  className,
}) => {
  // Validate data
  if (!data || !data.users || !Array.isArray(data.users)) {
    return (
      <div className={cn("w-full text-center py-8", className)}>
        <div className="text-gray-500">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm">No hay datos de usuarios disponibles</p>
        </div>
      </div>
    );
  }

  const { users } = data;
  const itemsPerPage = WIDGET_CONFIG.PAGINATION.ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));

  // Validate and clamp current page
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (validCurrentPage > 1) {
      const newPage = validCurrentPage - 1;
      onPageChange(newPage);
    }
  };

  const handleNextPage = () => {
    if (validCurrentPage < totalPages) {
      const newPage = validCurrentPage + 1;
      onPageChange(newPage);
    }
  };

  // If users array is empty
  if (users.length === 0) {
    return (
      <div className={cn("w-full text-center py-8", className)}>
        <div className="text-gray-500">
          <div className="text-2xl mb-2">👥</div>
          <p className="text-sm">No hay usuarios registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Nombre</th>
              <th className="text-left p-2 font-medium">Email</th>
              <th className="text-left p-2 font-medium">Plan</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="p-2">{user.name || "N/A"}</td>
                <td className="p-2 text-gray-600">{user.email || "N/A"}</td>
                <td className="p-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      getUserTypeStyles(user.type || "Básico")
                    )}
                  >
                    {user.type || "Básico"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-xs text-gray-500">
            Mostrando {startIndex + 1}-{Math.min(endIndex, users.length)} de{" "}
            {users.length} clientes
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={validCurrentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <span className="text-xs text-gray-600 px-2">
              {validCurrentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={validCurrentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
