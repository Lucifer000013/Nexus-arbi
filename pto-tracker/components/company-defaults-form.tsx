"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CompanySettings } from "@/lib/types";

export function CompanyDefaultsForm({ settings }: { settings: CompanySettings }) {
  const router = useRouter();
  const [pto, setPto] = useState(settings.default_pto_days_per_year);
  const [sick, setSick] = useState(settings.default_sick_days_per_year);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          default_pto_days_per_year: pto,
          default_sick_days_per_year: sick,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Vacation days per year
          <input
            type="number"
            min={0}
            value={pto}
            onChange={(e) => setPto(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sick days per year
          <input
            type="number"
            min={0}
            value={sick}
            onChange={(e) => setSick(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
      </div>
      <p className="text-xs text-slate-400">
        Changes apply only to employees added after saving.
      </p>
    </form>
  );
}
