import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: owner } = await admin
    .from("users")
    .select("*")
    .eq("email", user.email)
    .eq("archived", false)
    .maybeSingle();
  if (!owner || owner.role !== "owner") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const body = await request.json();
  const defaultPtoDays = Number(body.default_pto_days_per_year);
  const defaultSickDays = Number(body.default_sick_days_per_year);
  if (!Number.isFinite(defaultPtoDays) || defaultPtoDays < 0 || !Number.isFinite(defaultSickDays) || defaultSickDays < 0) {
    return NextResponse.json({ error: "Некорректные значения" }, { status: 400 });
  }

  const { data: updated, error } = await admin
    .from("company_settings")
    .update({
      default_pto_days_per_year: defaultPtoDays,
      default_sick_days_per_year: defaultSickDays,
    })
    .eq("company_id", owner.company_id)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? "Не удалось обновить настройки" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, settings: updated });
}
