"use client";

import { DayPicker } from "react-day-picker";
import { ru } from "react-day-picker/locale";
import "react-day-picker/style.css";
import type { LeaveRequest } from "@/lib/types";

function toDates(request: LeaveRequest): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(`${request.start_date}T00:00:00`);
  const end = new Date(`${request.end_date}T00:00:00`);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function MiniCalendar({ requests }: { requests: LeaveRequest[] }) {
  const approved = requests.filter((r) => r.status === "approved").flatMap(toDates);
  const pending = requests.filter((r) => r.status === "pending").flatMap(toDates);

  return (
    <DayPicker
      locale={ru}
      showOutsideDays
      modifiers={{ approved, pending }}
      modifiersClassNames={{
        approved: "bg-emerald-100 text-emerald-800 rounded-md",
        pending: "bg-amber-100 text-amber-800 rounded-md",
      }}
      className="rounded-xl border border-slate-200 p-3 text-sm"
    />
  );
}
