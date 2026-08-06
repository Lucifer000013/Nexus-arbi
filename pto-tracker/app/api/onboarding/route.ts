import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface EmployeeInput {
  name: string;
  email: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json();
  const companyName = String(body.companyName ?? "").trim();
  const ownerName = String(body.ownerName ?? "").trim();
  const defaultPtoDays = Number(body.defaultPtoDays);
  const defaultSickDays = Number(body.defaultSickDays);
  const employees: EmployeeInput[] = Array.isArray(body.employees)
    ? body.employees
        .map((e: EmployeeInput) => ({
          name: String(e.name ?? "").trim(),
          email: String(e.email ?? "").trim().toLowerCase(),
        }))
        .filter((e: EmployeeInput) => e.name && e.email)
    : [];

  if (!companyName || !ownerName) {
    return NextResponse.json({ error: "Заполните название компании и ваше имя" }, { status: 400 });
  }
  if (!Number.isFinite(defaultPtoDays) || defaultPtoDays < 0 || !Number.isFinite(defaultSickDays) || defaultSickDays < 0) {
    return NextResponse.json({ error: "Некорректные значения дней" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from("users")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();
  if (existingProfile) {
    return NextResponse.json({ error: "Онбординг уже завершён" }, { status: 409 });
  }

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: companyName })
    .select()
    .single();
  if (companyError || !company) {
    return NextResponse.json({ error: companyError?.message ?? "Не удалось создать компанию" }, { status: 500 });
  }

  const { error: settingsError } = await admin.from("company_settings").insert({
    company_id: company.id,
    default_pto_days_per_year: defaultPtoDays,
    default_sick_days_per_year: defaultSickDays,
  });
  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  const rows = [
    {
      company_id: company.id,
      email: user.email,
      name: ownerName,
      role: "owner" as const,
      pto_balance_days: defaultPtoDays,
      sick_balance_days: defaultSickDays,
    },
    ...employees
      .filter((e) => e.email !== user.email)
      .map((e) => ({
        company_id: company.id,
        email: e.email,
        name: e.name,
        role: "employee" as const,
        pto_balance_days: defaultPtoDays,
        sick_balance_days: defaultSickDays,
      })),
  ];

  const { error: usersError } = await admin.from("users").insert(rows);
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
