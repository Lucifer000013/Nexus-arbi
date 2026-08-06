"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RequestModal } from "@/components/request-modal";
import { RequestList } from "@/components/request-list";
import { MiniCalendar } from "@/components/mini-calendar";
import type { AppUser, LeaveRequest } from "@/lib/types";

export function EmployeeDashboard({
  profile,
  requests,
}: {
  profile: AppUser;
  requests: LeaveRequest[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <PageHeader title={`Привет, ${profile.name}`} subtitle="Ваш личный кабинет" />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Осталось дней отпуска</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {profile.pto_balance_days}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Осталось дней больничного</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {profile.sick_balance_days}
          </p>
        </div>
      </section>

      <button
        onClick={() => setModalOpen(true)}
        className="self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Подать заявку
      </button>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-5">
          <h2 className="mb-2 text-sm font-medium text-slate-500">Мои заявки</h2>
          <RequestList requests={requests} />
        </div>
        <div className="rounded-xl border border-slate-200 p-5">
          <h2 className="mb-2 text-sm font-medium text-slate-500">Календарь</h2>
          <MiniCalendar requests={requests} />
        </div>
      </section>

      {modalOpen && <RequestModal onClose={() => setModalOpen(false)} />}
    </main>
  );
}
