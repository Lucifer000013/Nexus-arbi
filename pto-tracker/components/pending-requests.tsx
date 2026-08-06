"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppUser, LeaveRequest } from "@/lib/types";

type PendingRequest = LeaveRequest & { employee: AppUser };

const typeLabel: Record<LeaveRequest["type"], string> = {
  vacation: "Отпуск",
  sick: "Больничный",
};

export function PendingRequests({ requests }: { requests: PendingRequest[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function decide(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    });
  }

  if (requests.length === 0) {
    return <p className="text-sm text-slate-400">Нет заявок, ожидающих решения.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {requests.map((request) => (
        <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {request.employee.name} · {typeLabel[request.type]}
            </p>
            <p className="text-xs text-slate-500">
              {request.start_date} — {request.end_date} · {request.days_count} раб. дн.
              {request.reason ? ` · ${request.reason}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => decide(request.id, "approved")}
              disabled={isPending}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Одобрить
            </button>
            <button
              onClick={() => decide(request.id, "rejected")}
              disabled={isPending}
              className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              Отклонить
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
