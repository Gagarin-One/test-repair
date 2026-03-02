import React, { createContext, useContext, useState } from 'react';

interface User {
  id: number;
  username: string;
  role: 'dispatcher' | 'master';
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Тестовые пользователи
export const AVAILABLE_USERS: User[] = [
  { id: 1, username: 'Диспетчер', role: 'dispatcher' },
  { id: 2, username: 'Мастер Иван', role: 'master' },
  { id: 3, username: 'Мастер Пётр', role: 'master' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};