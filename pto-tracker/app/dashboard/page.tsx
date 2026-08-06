import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { EmployeeDashboard } from "@/components/employee-dashboard";
import { OwnerDashboard } from "@/components/owner-dashboard";
import type { AppUser, LeaveRequest } from "@/lib/types";

export default async function DashboardPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/");
  if (!current.profile) redirect("/onboarding");

  const profile = current.profile;
  const supabase = await createClient();

  if (profile.role === "owner") {
    const [{ data: employees }, { data: pendingRequests }, { data: approvedRequests }] =
      await Promise.all([
        supabase
          .from("users")
          .select("*")
          .eq("company_id", profile.company_id)
          .eq("archived", false)
          .order("name"),
        supabase
          .from("requests")
          .select("*, employee:users!requests_user_id_fkey(id, name, email)")
          .eq("status", "pending")
          .order("created_at", { ascending: true }),
        supabase
          .from("requests")
          .select("*, employee:users!requests_user_id_fkey(id, name, email)")
          .eq("status", "approved")
          .order("start_date", { ascending: true }),
      ]);

    return (
      <OwnerDashboard
        owner={profile}
        employees={(employees ?? []) as AppUser[]}
        pendingRequests={(pendingRequests ?? []) as Array<LeaveRequest & { employee: AppUser }>}
        approvedRequests={(approvedRequests ?? []) as Array<LeaveRequest & { employee: AppUser }>}
      />
    );
  }

  const { data: myRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <EmployeeDashboard profile={profile} requests={(myRequests ?? []) as LeaveRequest[]} />
  );
}
