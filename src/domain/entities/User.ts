export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 