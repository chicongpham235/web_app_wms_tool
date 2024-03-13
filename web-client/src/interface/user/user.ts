export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}
