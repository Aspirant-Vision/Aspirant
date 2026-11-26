import { UserRole, AccountStatus } from "./database.types";
import { User, Session } from "@supabase/supabase-js";

export type { UserRole, AccountStatus };

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  city: string | null;
  state: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface RolePermissions {
  canAccessAdmin: boolean;
  canManageColleges: boolean;
  canManageLeads: boolean;
  canManageUsers: boolean;
  canAccessCounseling: boolean;
}
