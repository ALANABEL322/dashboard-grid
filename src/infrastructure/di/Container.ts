import { AuthService } from '../../domain/services/AuthService';
import { MockUserRepository } from '../repositories/MockUserRepository';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { GetCurrentUserUseCase } from '../../application/use-cases/GetCurrentUserUseCase';

// Instancias singleton
const userRepository = new MockUserRepository();
const authService = new AuthService(userRepository);

// Casos de uso
export const loginUseCase = new LoginUseCase(authService);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authService); 