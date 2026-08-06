import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function PageHeader({
  title,
  subtitle,
  settingsHref,
}: {
  title: string;
  subtitle?: string;
  settingsHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {settingsHref && (
          <Link
            href={settingsHref}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Настройки
          </Link>
        )}
        <SignOutButton />
      </div>
    </div>
  );
}
