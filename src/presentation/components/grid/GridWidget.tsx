import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGridStore, type GridWidgetData } from "../../stores/gridStore";

interface GridWidgetProps {
  widget: GridWidgetData;
  isEditMode: boolean;
  onToggleVisibility: (id: string) => void;
  onRemoveWidget: (id: string) => void;
}

const WidgetContent: React.FC<{ widget: GridWidgetData }> = ({ widget }) => {
  // Obtener el estado del paginado desde el store en lugar de estado local
  const { setWidgetPage, getWidgetPage } = useGridStore();
  const currentPage = getWidgetPage(widget.id);
  const itemsPerPage = 5; // Mostrar 5 usuarios por página

  switch (widget.type) {
    case "user-table":
      const users = widget.data.users;
      const totalPages = Math.ceil(users.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentUsers = users.slice(startIndex, endIndex);

      const handlePrevPage = () => {
        const newPage = Math.max(currentPage - 1, 1);
        setWidgetPage(widget.id, newPage);
      };

      const handleNextPage = () => {
        const newPage = Math.min(currentPage + 1, totalPages);
        setWidgetPage(widget.id, newPage);
      };

      return (
        <div className="w-full">
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
                {currentUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2 text-gray-600">{user.email}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.type === "VIP"
                            ? "bg-purple-100 text-purple-800"
                            : user.type === "Premium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginado */}
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

    case "user-stats":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {widget.data.totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Clientes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {widget.data.activeUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {widget.data.newUsersToday}
            </p>
            <p className="text-sm text-gray-500">Nuevos Hoy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {widget.data.adminUsers}
            </p>
            <p className="text-sm text-gray-500">VIP</p>
          </div>
        </div>
      );

    case "user-activity":
      return (
        <div className="space-y-3">
          {widget.data.activities.map((activity: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-start border-b border-gray-100 pb-2"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.user}</p>
                <p className="text-xs text-gray-600">{activity.action}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      );

    case "user-growth":
      return (
        <div>
          <div className="mb-4">
            <p className="text-2xl font-bold text-green-600">
              +{widget.data.percentage}%
            </p>
            <p className="text-sm text-gray-500">Crecimiento mensual</p>
          </div>
          <div className="space-y-2">
            {widget.data.monthly.slice(-3).map((month: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{month.month}</span>
                <span className="font-medium text-sm">
                  {month.users} clientes
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "user-locations":
      return (
        <div className="space-y-3">
          {widget.data.locations.map((location: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {location.country}
                  </span>
                  <span className="text-xs text-gray-500">
                    {location.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${location.percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-600">
                {location.users}
              </span>
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

// Modal de confirmación para eliminar widget
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

  // Función para obtener el número del widget basado en su ID
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

  // Sincronizar atributos del DOM con el store
  useEffect(() => {
    const element = widgetRef.current;
    if (!element) return;

    // Actualizar atributos si hay cambios
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

  // En modo vista, no renderizar widgets ocultos
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

          {/* Botón de eliminar en modo edición */}
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

          {/* Indicador de modo edición con número de widget */}
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

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        widgetTitle={widget.title}
      />
    </>
  );
};
