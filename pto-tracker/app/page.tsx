import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { LoginForm } from "./login/login-form";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const current = await getCurrentUser();

  if (current) {
    redirect(current.profile ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-50 px-6 py-16">
      <div className="flex max-w-lg flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          PTO Tracker
        </span>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Учёт отпусков и больничных для малых команд
        </h1>
        <p className="text-balance text-slate-600">
          Сотрудники подают заявки в пару кликов, вы одобряете их из одного экрана,
          а баланс дней считается автоматически. Вход без паролей — по ссылке на почту.
        </p>
      </div>

      {error === "auth" && (
        <p className="text-sm text-red-600">
          Не удалось войти по ссылке. Попробуйте отправить письмо ещё раз.
        </p>
      )}

      <LoginForm />
    </main>
  );
}
