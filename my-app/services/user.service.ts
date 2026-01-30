import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
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

    if (!res.ok) return new Error(result.message);

    return result;
  } catch (e) {
    return e;
  }
};
export const changePassword = async (password: string) => {

  const { data, error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) throw error;

  return data;
}
