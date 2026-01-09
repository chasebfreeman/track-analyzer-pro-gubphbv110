
export interface UserProfile {
  id: string;
  name: string;
  pinHash: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  isActive: boolean;
}

export interface UserProfileDB {
  id: string;
  name: string;
  pin_hash: string;
  color: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}
