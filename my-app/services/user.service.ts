import { useAuthStore } from '@/store/useAuthStore';
import Error from 'next/error';

export interface dataProfile {
  id: string;
  email: string;
  name?: string;
  address?: string;
  phone?: string;
}

export const getUserProfile = async (userid: string): Promise<dataProfile | null> => {

  console.log("user profile Fetching")
  const res = await fetch('api/data/getdataProfile', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      "userId": userid
    })
  });

  if (!res) return null;

  const data = await res.json()
  console.log("data", data)
  return {
    id: data?.id,
    email: data?.email || '',
    name: data?.name || '',
    address: data?.address || '',
    phone: data?.phone_no || '',
  };
};

export const updateUser = async (
  data: { name?: string; address?: string; phone?: string }
) => {
  try {
    const res = await fetch('/api/data/update', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || result.error || "Update failed");

    return result;
  } catch (e: any) {
    throw e;
  }
};
export const changePassword = async (password: string) => {
  const session = useAuthStore.getState().session;
  const res = await fetch(`http://localhost:8080/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': session ? session.access_token : ''
    },
    body: JSON.stringify({ password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Password change failed");
  }

  return data;
}
