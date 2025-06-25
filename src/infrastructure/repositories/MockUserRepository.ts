import { User, CreateUserDto, LoginCredentials } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

// Datos mockeados
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  }
];

// Mock passwords (en producción estarían hasheadas)
const mockPasswords: Record<string, string> = {
  'admin@example.com': 'admin123',
  'john.doe@example.com': 'password123'
};

export class MockUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = mockUsers.find(u => u.email === email);
    return user || null;
  }

  async create(userData: CreateUserDto): Promise<User> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email: userData.email,
      name: userData.name,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockUsers.push(newUser);
    mockPasswords[userData.email] = userData.password;
    
    return newUser;
  }

  async authenticate(credentials: LoginCredentials): Promise<User | null> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = await this.findByEmail(credentials.email);
    if (!user) return null;
    
    const storedPassword = mockPasswords[credentials.email];
    if (storedPassword !== credentials.password) return null;
    
    return user;
  }
} 