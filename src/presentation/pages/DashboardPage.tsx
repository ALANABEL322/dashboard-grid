import { useAuth } from "../hooks/useAuth";
import { Home } from "lucide-react";

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Home className="h-8 w-8" />
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8">¡Bienvenido, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información del Usuario
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID:</span>
              <span className="text-gray-900">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rol:</span>
              <span className="text-gray-900 capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registrado:</span>
              <span className="text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Estadísticas
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sesiones activas:</span>
              <span className="text-green-600 font-medium">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Último acceso:</span>
              <span className="text-gray-900">Hoy</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
              Ver Grid
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
              Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
