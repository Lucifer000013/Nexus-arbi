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
          Vacation and sick leave tracking for small teams
        </h1>
        <p className="text-balance text-slate-600">
          Employees submit requests in a couple of clicks, you approve them from a single
          screen, and day balances update automatically. No passwords — just a magic link
          sent to your email.
        </p>
      </div>

      {error === "auth" && (
        <p className="text-sm text-red-600">
          We couldn&apos;t sign you in with that link. Please try sending the email again.
        </p>
      )}

      <LoginForm />
    </main>
  );
}
