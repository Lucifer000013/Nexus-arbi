import { StatusBadge } from "@/components/status-badge";
import type { LeaveRequest } from "@/lib/types";

const typeLabel: Record<LeaveRequest["type"], string> = {
  vacation: "Vacation",
  sick: "Sick leave",
};

export function RequestList({ requests }: { requests: LeaveRequest[] }) {
  if (requests.length === 0) {
    return <p className="text-sm text-slate-400">No requests yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {requests.map((request) => (
        <li key={request.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {typeLabel[request.type]} · {request.start_date} — {request.end_date}
            </p>
            <p className="text-xs text-slate-500">
              {request.days_count} business day{request.days_count === 1 ? "" : "s"}
              {request.reason ? ` · ${request.reason}` : ""}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </li>
      ))}
    </ul>
  );
}
