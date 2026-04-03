import { apiClient, ApiException } from "@/lib/api-client";
import { toast } from "@/store/useToastStore";

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export interface UserManagementData {
  id: string;
  name: string;
  email: string;
  phone_no: string;
  role: Role
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone_no: string;
  role: Role
  password: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone_no?: string;
  password?: string;
  role?: Role
}

export class UserManagementService {
  static async getAll(): Promise<UserManagementData[]> {
    try {
      return await apiClient.get<UserManagementData[]>('/api/users/getAll');
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to fetch users');
      }
      throw error;
    }
  }

  static async create(payload: CreateUserPayload): Promise<UserManagementData> {
    try {
      const data = await apiClient.post<UserManagementData>('/api/users/create', payload);
      toast.success('User created successfully');
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to create user');
      }
      throw error;
    }
  }

  static async update(id: string, payload: UpdateUserPayload): Promise<UserManagementData> {
    try {
      (payload);
      const data = await apiClient.put<UserManagementData>(`/api/users/update/${id}`, payload);
      toast.success('User updated successfully');
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to update user');
      }
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/users/delete/${id}`);
      toast.success('User deleted successfully');
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to delete user');
      }
      throw error;
    }
  }
}
