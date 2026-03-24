const host = "http://localhost:8080";

export interface UserManagementData {
  id: string;
  name: string;
  email: string;
  phone_no: string;
  role: 'admin' | 'manager';
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone_no: string;
  role: 'admin' | 'manager';
  password: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone_no?: string;
  role?: 'admin' | 'manager';
}

export class UserManagementService {
  static async getAll(): Promise<UserManagementData[]> {
    const response = await fetch(`${host}/api/users/getAll`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to fetch users");
    }
    return data;
  }

  static async create(payload: CreateUserPayload): Promise<UserManagementData> {
    const response = await fetch(`${host}/api/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create user');
    }
    return data;
  }

  static async update(id: string, payload: UpdateUserPayload): Promise<UserManagementData> {
    const response = await fetch(`${host}/api/users/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update user');
    }
    return data;
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${host}/api/users/delete/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete user');
    }
  }
}
