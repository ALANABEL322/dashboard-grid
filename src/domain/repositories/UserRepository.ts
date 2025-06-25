import { User, CreateUserDto, LoginCredentials } from "../entities/User";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  authenticate(credentials: LoginCredentials): Promise<User | null>;
}
