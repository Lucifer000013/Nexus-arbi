import { Resend } from "resend";
import type { AppUser, LeaveRequest } from "@/lib/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? "PTO Tracker <notifications@example.com>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const typeLabel: Record<LeaveRequest["type"], string> = {
  vacation: "отпуск",
  sick: "больничный",
};

const statusLabel: Record<LeaveRequest["status"], string> = {
  pending: "ожидает решения",
  approved: "одобрена",
  rejected: "отклонена",
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
    `Новая заявка на ${typeLabel[request.type]} от ${employee.name}`,
    `<p>${employee.name} подал(а) заявку на ${typeLabel[request.type]}:</p>
     <p><b>${request.start_date} — ${request.end_date}</b> (${request.days_count} дн.)</p>
     ${request.reason ? `<p>Комментарий: ${request.reason}</p>` : ""}
     <p><a href="${siteUrl}/dashboard">Открыть заявки</a></p>`
  );
}

export async function notifyEmployeeOfDecision(employee: AppUser, request: LeaveRequest) {
  await send(
    employee.email,
    `Ваша заявка на ${typeLabel[request.type]} ${statusLabel[request.status]}`,
    `<p>Заявка на ${typeLabel[request.type]} (${request.start_date} — ${request.end_date}) ${statusLabel[request.status]}.</p>
     <p><a href="${siteUrl}/dashboard">Открыть личный кабинет</a></p>`
  );
}
