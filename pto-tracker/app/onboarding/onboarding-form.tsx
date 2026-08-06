"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface EmployeeRow {
  name: string;
  email: string;
}

function parseBulkList(text: string): EmployeeRow[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, email] = line.split(",").map((part) => part.trim());
      return { name: name ?? "", email: email ?? "" };
    })
    .filter((row) => row.name && row.email);
}

export function OnboardingForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [defaultPtoDays, setDefaultPtoDays] = useState(20);
  const [defaultSickDays, setDefaultSickDays] = useState(10);
  const [employees, setEmployees] = useState<EmployeeRow[]>([{ name: "", email: "" }]);
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateEmployee(index: number, field: keyof EmployeeRow, value: string) {
    setEmployees((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setEmployees((rows) => [...rows, { name: "", email: "" }]);
  }

  function removeRow(index: number) {
    setEmployees((rows) => rows.filter((_, i) => i !== index));
  }

  function applyBulkText() {
    const parsed = parseBulkList(bulkText);
    if (parsed.length === 0) return;
    setEmployees((rows) => {
      const nonEmpty = rows.filter((r) => r.name && r.email);
      return [...nonEmpty, ...parsed];
    });
    setBulkText("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanedEmployees = employees.filter((row) => row.name && row.email);

    startTransition(async () => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          ownerName,
          defaultPtoDays,
          defaultSickDays,
          employees: cleanedEmployees,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить настройки");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-slate-500">Компания</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Название компании
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              placeholder="ООО «Ромашка»"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Ваше имя
            <input
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              placeholder="Иван Иванов"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-slate-500">Дни по умолчанию (в год)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Дней отпуска
            <input
              type="number"
              min={0}
              required
              value={defaultPtoDays}
              onChange={(e) => setDefaultPtoDays(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Дней больничного
            <input
              type="number"
              min={0}
              required
              value={defaultSickDays}
              onChange={(e) => setDefaultSickDays(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-slate-500">Сотрудники (необязательно)</h2>

        <div className="flex flex-col gap-2">
          {employees.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={row.name}
                onChange={(e) => updateEmployee(index, "name", e.target.value)}
                placeholder="Имя"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <input
                value={row.email}
                onChange={(e) => updateEmployee(index, "email", e.target.value)}
                placeholder="email@company.com"
                type="email"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="rounded-lg border border-slate-200 px-3 text-sm text-slate-500 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="self-start text-sm font-medium text-slate-700 underline underline-offset-2"
          >
            + Добавить строку
          </button>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 p-3">
          <p className="text-xs text-slate-500">
            Или вставьте список построчно: <code>Имя, email</code>
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={3}
            placeholder={"Анна Смирнова, anna@company.com\nПётр Петров, petr@company.com"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={applyBulkText}
            className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Добавить из списка
          </button>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Сохраняем..." : "Создать компанию"}
      </button>
    </form>
  );
}
