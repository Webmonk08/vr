type users = {
  id: number; // int4 in DB
  email: string; // varchar in DB
  password_hash: string; // matches DB schema
  role: 'admin' | 'customer'; // matches profile tables
  created_at: string | Date; // timestamp in DB
  name: string; // text in DB
}
export type { users }


