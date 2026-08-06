import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { CompanyDefaultsForm } from "@/components/company-defaults-form";
import { EmployeeManagementList } from "@/components/employee-management-list";
import type { AppUser, CompanySettings } from "@/lib/types";

export default async function SettingsPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/");
  if (!current.profile) redirect("/onboarding");
  if (current.profile.role !== "owner") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: settings }, { data: employees }] = await Promise.all([
    supabase
      .from("company_settings")
      .select("*")
      .eq("company_id", current.profile.company_id)
      .single(),
    supabase
      .from("users")
      .select("*")
      .eq("company_id", current.profile.company_id)
      .order("archived")
      .order("name"),
  ]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <PageHeader title="Company settings" />

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="mb-3 text-sm font-medium text-slate-500">
          Default days for new employees
        </h2>
        <CompanyDefaultsForm settings={settings as CompanySettings} />
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="mb-3 text-sm font-medium text-slate-500">Employees</h2>
        <EmployeeManagementList employees={(employees ?? []) as AppUser[]} />
      </section>
    </main>
  );
}
