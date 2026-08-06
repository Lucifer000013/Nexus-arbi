"use client";

import { useState } from "react";
import { EditEmployeeModal } from "@/components/edit-employee-modal";
import type { AppUser } from "@/lib/types";

export function EmployeeTable({ employees }: { employees: AppUser[] }) {
  const [editing, setEditing] = useState<AppUser | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-4 font-medium">Имя</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Отпуск</th>
              <th className="py-2 pr-4 font-medium">Больничный</th>
              <th className="py-2 pr-4 font-medium" />
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-800">
                  {employee.name}
                  {employee.role === "owner" && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      владелец
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 text-slate-500">{employee.email}</td>
                <td className="py-2 pr-4 text-slate-700">{employee.pto_balance_days}</td>
                <td className="py-2 pr-4 text-slate-700">{employee.sick_balance_days}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => setEditing(employee)}
                    className="text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
                  >
                    Редактировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <EditEmployeeModal employee={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
