import { User, LoginCredentials } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(credentials: LoginCredentials): Promise<User | null> {
    return await this.userRepository.authenticate(credentials);
  }

  async getCurrentUser(token: string): Promise<User | null> {
    const email = this.decodeToken(token);
    if (!email) return null;
    
    return await this.userRepository.findByEmail(email);
  }

  private decodeToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email;
    } catch {
      return null;
    }
  }

  generateToken(user: User): string {
    const payload = { email: user.email, id: user.id };
    return btoa(JSON.stringify(payload));
  }
} 