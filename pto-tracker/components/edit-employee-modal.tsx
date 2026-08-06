"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/types";

export function EditEmployeeModal({
  employee,
  onClose,
}: {
  employee: AppUser;
  onClose: () => void;
}) {
  const router = useRouter();
  const [ptoBalance, setPtoBalance] = useState(employee.pto_balance_days);
  const [sickBalance, setSickBalance] = useState(employee.sick_balance_days);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pto_balance_days: ptoBalance,
          sick_balance_days: sickBalance,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{employee.name}</h2>
        <p className="text-sm text-slate-500">{employee.email}</p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Баланс отпуска (дней)
            <input
              type="number"
              value={ptoBalance}
              onChange={(e) => setPtoBalance(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Баланс больничного (дней)
            <input
              type="number"
              value={sickBalance}
              onChange={(e) => setSickBalance(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {pending ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
