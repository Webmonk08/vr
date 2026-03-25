import { apiClient, ApiException } from "@/lib/api-client";
import { toast } from "@/store/useToastStore";

export interface dataProfile {
  id: string;
  email: string;
  name?: string;
  address?: string;
  phone?: string;
}

export const getUserProfile = async (userid: string): Promise<dataProfile | null> => {
  try {
    const data = await apiClient.post<dataProfile>('/api/data/getdataProfile', {
      userId: userid
    });
    return {
      id: data?.id,
      email: data?.email || '',
      name: data?.name || '',
      address: data?.address || '',
      phone: data?.phone || '',
    };
  } catch (error) {
    if (error instanceof ApiException) {
      toast.error(error.getUserMessage());
    } else {
      toast.error('Failed to fetch profile');
    }
    return null;
  }
};

export const updateUser = async (data: { UserId?: string; name?: string; address?: string; phone?: string }) => {
  try {
    const result = await apiClient.post('/api/data/update', data);
    toast.success('Profile updated successfully');
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      toast.error(error.getUserMessage());
    } else {
      toast.error('Failed to update profile');
    }
    throw error;
  }
};

export const changePassword = async (password: string, accessToken: string) => {
  try {
    const data = await apiClient.post('/api/auth/change-password', { password }, {
      headers: { Authorization: accessToken },
    });
    toast.success('Password changed successfully');
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      toast.error(error.getUserMessage());
    } else {
      toast.error('Failed to change password');
    }
    throw error;
  }
};
