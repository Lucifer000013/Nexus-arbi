export type UserRole = "owner" | "employee";
export type RequestType = "vacation" | "sick";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  company_id: string;
  email: string;
  name: string;
  role: UserRole;
  pto_balance_days: number;
  sick_balance_days: number;
  archived: boolean;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  type: RequestType;
  start_date: string;
  end_date: string;
  days_count: number;
  status: RequestStatus;
  reason: string | null;
  created_at: string;
  decided_at: string | null;
}

export interface CompanySettings {
  company_id: string;
  default_pto_days_per_year: number;
  default_sick_days_per_year: number;
}
