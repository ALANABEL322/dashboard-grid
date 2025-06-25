import { LoginCredentials, User } from "../../domain/entities/User";
import { AuthService } from "../../domain/services/AuthService";

export class LoginUseCase {
  constructor(private authService: AuthService) {}

  async execute(credentials: LoginCredentials): Promise<{
    user: User;
    token: string;
  } | null> {
    const user = await this.authService.login(credentials);

    if (!user) {
      return null;
    }

    const token = this.authService.generateToken(user);

    return {
      user,
      token,
    };
  }
}
