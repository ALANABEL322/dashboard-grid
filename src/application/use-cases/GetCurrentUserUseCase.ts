import { User } from "../../domain/entities/User";
import { AuthService } from "../../domain/services/AuthService";

export class GetCurrentUserUseCase {
  constructor(private authService: AuthService) {}

  async execute(token: string): Promise<User | null> {
    return await this.authService.getCurrentUser(token);
  }
}
