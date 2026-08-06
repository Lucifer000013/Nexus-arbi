import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const { data: target } = await admin.from("users").select("*").eq("id", id).maybeSingle();
  if (!target || target.company_id !== owner.company_id) {
    return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
  }

  const body = await request.json();
  const update: Record<string, unknown> = {};

  if (body.pto_balance_days !== undefined) {
    const value = Number(body.pto_balance_days);
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "Некорректный баланс отпуска" }, { status: 400 });
    }
    update.pto_balance_days = value;
  }
  if (body.sick_balance_days !== undefined) {
    const value = Number(body.sick_balance_days);
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "Некорректный баланс больничного" }, { status: 400 });
    }
    update.sick_balance_days = value;
  }
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "Имя не может быть пустым" }, { status: 400 });
    update.name = name;
  }
  if (body.archived !== undefined) {
    update.archived = Boolean(body.archived);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
  }

  const { data: updated, error } = await admin
    .from("users")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? "Не удалось обновить сотрудника" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, employee: updated });
}
