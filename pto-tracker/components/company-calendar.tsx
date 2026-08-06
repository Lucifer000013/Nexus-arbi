"use client";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { ru } from "react-day-picker/locale";
import "react-day-picker/style.css";
import type { AppUser, LeaveRequest } from "@/lib/types";

type ApprovedRequest = LeaveRequest & { employee: AppUser };

function dateRange(request: LeaveRequest): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(`${request.start_date}T00:00:00`);
  const end = new Date(`${request.end_date}T00:00:00`);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function CompanyCalendar({ requests }: { requests: ApprovedRequest[] }) {
  const byDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const request of requests) {
      for (const date of dateRange(request)) {
        const key = date.toDateString();
        const names = map.get(key) ?? [];
        names.push(request.employee.name);
        map.set(key, names);
      }
    }
    return map;
  }, [requests]);

  const single = [...byDate.entries()].filter(([, names]) => names.length === 1).map(([key]) => new Date(key));
  const overlap = [...byDate.entries()].filter(([, names]) => names.length > 1).map(([key]) => new Date(key));

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <DayPicker
        locale={ru}
        showOutsideDays
        modifiers={{ single, overlap }}
        modifiersClassNames={{
          single: "bg-sky-100 text-sky-800 rounded-md",
          overlap: "bg-rose-100 text-rose-800 rounded-md font-semibold",
        }}
        className="rounded-xl border border-slate-200 p-3 text-sm"
      />
      <div className="flex flex-1 flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded bg-sky-100" /> Один сотрудник в отпуске
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded bg-rose-100" /> Пересечение нескольких сотрудников
        </div>
        {requests.length === 0 && (
          <p className="mt-2 text-slate-400">Пока нет одобренных отпусков/больничных.</p>
        )}
        <ul className="mt-2 flex flex-col gap-1">
          {requests.map((r) => (
            <li key={r.id} className="text-slate-600">
              <span className="font-medium text-slate-800">{r.employee.name}</span>{" "}
              {r.start_date} — {r.end_date}
              {r.type === "sick" ? " (больничный)" : " (отпуск)"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
