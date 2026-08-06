"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PendingRequests } from "@/components/pending-requests";
import { EmployeeTable } from "@/components/employee-table";
import { CompanyCalendar } from "@/components/company-calendar";
import { AddEmployeeModal } from "@/components/add-employee-modal";
import type { AppUser, LeaveRequest } from "@/lib/types";

type WithEmployee = LeaveRequest & { employee: AppUser };

export function OwnerDashboard({
  owner,
  employees,
  pendingRequests,
  approvedRequests,
}: {
  owner: AppUser;
  employees: AppUser[];
  pendingRequests: WithEmployee[];
  approvedRequests: WithEmployee[];
}) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <PageHeader title={`Привет, ${owner.name}`} subtitle="Панель владельца" settingsHref="/settings" />

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="mb-2 text-sm font-medium text-slate-500">
          Заявки на рассмотрении {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </h2>
        <PendingRequests requests={pendingRequests} />
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-500">Сотрудники</h2>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Добавить сотрудника
          </button>
        </div>
        <EmployeeTable employees={employees} />
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="mb-3 text-sm font-medium text-slate-500">Календарь компании</h2>
        <CompanyCalendar requests={approvedRequests} />
      </section>

      {addOpen && <AddEmployeeModal onClose={() => setAddOpen(false)} />}
    </main>
  );
}
