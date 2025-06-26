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
  const { users } = data;
  const itemsPerPage = WIDGET_CONFIG.PAGINATION.ITEMS_PER_PAGE;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    onPageChange(newPage);
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    onPageChange(newPage);
  };

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
                <td className="p-2">{user.name}</td>
                <td className="p-2 text-gray-600">{user.email}</td>
                <td className="p-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      getUserTypeStyles(user.type)
                    )}
                  >
                    {user.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            disabled={currentPage === 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          <span className="text-xs text-gray-600 px-2">
            {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
