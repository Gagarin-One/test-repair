export type UserRole = 'dispatcher' | 'master';

export interface User {
  id: number;
  username: string;
  password: string; // в реальном проекте храним хеш
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'done' | 'canceled';

export interface Request {
  id: number;
  client_name: string;
  phone: string;
  address: string;
  problem_text: string;
  status: RequestStatus;
  assigned_to: number | null;
  created_at: Date;
  updated_at: Date;
}

// Для создания заявки (без полей, которые генерируются БД)
export type CreateRequestDto = {
  clientName: string;
  phone: string;
  address: string;
  problemText: string;
};

// В src/types/index.ts замените UpdateRequestDto на:

export type UpdateRequestDto = {
  status?: RequestStatus | null | undefined;
  assignedTo?: number | null | undefined;
};