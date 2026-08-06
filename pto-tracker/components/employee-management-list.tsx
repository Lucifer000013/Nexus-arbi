"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/types";

export function EmployeeManagementList({ employees }: { employees: AppUser[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleArchived(employee: AppUser) {
    startTransition(async () => {
      await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !employee.archived }),
      });
      router.refresh();
    });
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {employees.map((employee) => (
        <li key={employee.id} className="flex items-center justify-between gap-3 py-3">
          <div>
            <p className={`text-sm font-medium ${employee.archived ? "text-slate-400 line-through" : "text-slate-800"}`}>
              {employee.name}
              {employee.role === "owner" && (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  owner
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500">{employee.email}</p>
          </div>
          {employee.role !== "owner" && (
            <button
              onClick={() => toggleArchived(employee)}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              {employee.archived ? "Restore" : "Archive"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
