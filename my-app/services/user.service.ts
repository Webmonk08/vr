
import { supabase } from '@/utils/supabase';

export const updateUser = async (data: { name?: string; address?: string; phone?: string }) => {
  const res = await fetch('/api/users/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message || 'Failed to update user')
  }

  return result
}

export const changePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) throw error;

  return data;
}
