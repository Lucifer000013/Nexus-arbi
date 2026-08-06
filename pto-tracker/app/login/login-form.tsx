"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "./actions";

export function LoginForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3"
      action={(formData: FormData) => {
        startTransition(async () => {
          const result = await sendMagicLink(formData);
          if (result.ok) {
            setStatus("sent");
            setError(null);
          } else {
            setStatus("error");
            setError(result.error ?? "Не удалось отправить письмо");
          }
        });
      }}
    >
      {status === "sent" ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Мы отправили ссылку для входа на вашу почту. Проверьте инбокс и перейдите по ссылке.
        </p>
      ) : (
        <>
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {pending ? "Отправляем..." : "Войти по email"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      )}
    </form>
  );
}
