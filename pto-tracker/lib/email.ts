import { Resend } from "resend";
import type { AppUser, LeaveRequest } from "@/lib/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? "PTO Tracker <notifications@example.com>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const typeLabel: Record<LeaveRequest["type"], string> = {
  vacation: "vacation",
  sick: "sick leave",
};

const statusLabel: Record<LeaveRequest["status"], string> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping send:", subject);
    return;
  }
  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (err) {
    console.error("[email] failed to send:", err);
  }
}

export async function notifyOwnerOfNewRequest(
  owner: AppUser,
  employee: AppUser,
  request: LeaveRequest
) {
  await send(
    owner.email,
    `New ${typeLabel[request.type]} request from ${employee.name}`,
    `<p>${employee.name} submitted a ${typeLabel[request.type]} request:</p>
     <p><b>${request.start_date} — ${request.end_date}</b> (${request.days_count} day${request.days_count === 1 ? "" : "s"})</p>
     ${request.reason ? `<p>Comment: ${request.reason}</p>` : ""}
     <p><a href="${siteUrl}/dashboard">Open requests</a></p>`
  );
}

export async function notifyEmployeeOfDecision(employee: AppUser, request: LeaveRequest) {
  await send(
    employee.email,
    `Your ${typeLabel[request.type]} request has been ${statusLabel[request.status]}`,
    `<p>Your ${typeLabel[request.type]} request (${request.start_date} — ${request.end_date}) has been ${statusLabel[request.status]}.</p>
     <p><a href="${siteUrl}/dashboard">Open your dashboard</a></p>`
  );
}
