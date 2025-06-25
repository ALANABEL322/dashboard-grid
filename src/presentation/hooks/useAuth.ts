import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { loginUseCase, getCurrentUserUseCase } from '../../infrastructure/di/Container';
import { LoginCredentials } from '../../domain/entities/User';

export const useAuth = () => {
  const { user, token, isLoading, error, setUser, clearUser, setLoading, setError } = useAuthStore();

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginUseCase.execute(credentials);
      
      if (result) {
        setUser(result.user, result.token);
        return { success: true };
      } else {
        setError('Credenciales inválidas');
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (err) {
      const errorMessage = 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  const logout = useCallback(() => {
    clearUser();
  }, [clearUser]);

  const checkAuth = useCallback(async () => {
    if (!token) return false;
    
    try {
      const currentUser = await getCurrentUserUseCase.execute(token);
      if (currentUser) {
        setUser(currentUser, token);
        return true;
      } else {
        clearUser();
        return false;
      }
    } catch {
      clearUser();
      return false;
    }
  }, [token, setUser, clearUser]);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };
}; 