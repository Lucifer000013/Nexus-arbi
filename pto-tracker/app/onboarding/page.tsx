import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const current = await getCurrentUser();

  if (!current) redirect("/");
  if (current.profile) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          Шаг 1 из 1
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Настройте компанию
        </h1>
        <p className="mt-1 text-slate-600">
          Вы войдёте как владелец ({current.email}). Дальше сможете добавить сотрудников.
        </p>
      </div>
      <OnboardingForm />
    </main>
  );
}
