const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Request {
  id: number;
  client_name: string;
  phone: string;
  address: string;
  problem_text: string;
  status: 'new' | 'assigned' | 'in_progress' | 'done' | 'canceled';
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestDto {
  clientName: string;
  phone: string;
  address: string;
  problemText: string;
}

export interface User {
  id: number;
  username: string;
  role: 'dispatcher' | 'master';
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }
    return response.json();
  }

  // Requests API
  async getRequests(filters?: { status?: string; assignedTo?: number | null }): Promise<Request[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo !== undefined) {
      params.append('assignedTo', filters.assignedTo === null ? 'null' : filters.assignedTo.toString());
    }
    
    const response = await fetch(`${this.baseUrl}/requests?${params}`);
    return this.handleResponse<Request[]>(response);
  }

  async createRequest(data: CreateRequestDto): Promise<Request> {
    const response = await fetch(`${this.baseUrl}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Request>(response);
  }

  async getRequestById(id: number): Promise<Request> {
    const response = await fetch(`${this.baseUrl}/requests/${id}`);
    return this.handleResponse<Request>(response);
  }

  async updateRequest(id: number, data: { status?: string; assignedTo?: number | null }): Promise<Request> {
    const response = await fetch(`${this.baseUrl}/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Request>(response);
  }

  async takeRequest(requestId: number, masterId: number): Promise<Request> {
    const response = await fetch(`${this.baseUrl}/requests/${requestId}/take`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterId }),
    });
    return this.handleResponse<Request>(response);
  }

  // Users API (добавим позже при необходимости)
  async getMasters(): Promise<User[]> {
    // TODO: добавить эндпоинт на бэкенде
    return [
      { id: 2, username: 'master1', role: 'master' },
      { id: 3, username: 'master2', role: 'master' },
    ];
  }
}

export const api = new ApiClient(API_BASE);