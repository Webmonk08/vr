// profiles.ts

export type CustomerProfile = {
  user_id: number; // Primary Key (int4)
  shipping_address: string;
  phone_number: string;
};

export type AdminProfile = {
  user_id: number;
  employee_id: string;
  phone_number: string;
};
