import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Bienvenido, {user?.name}!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Has iniciado sesión exitosamente en el Dashboard Grid
              </p>

              <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
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
                    <span className="text-gray-900 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registrado:</span>
                    <span className="text-gray-900">
                      {user?.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
