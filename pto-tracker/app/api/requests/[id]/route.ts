import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyEmployeeOfDecision } from "@/lib/email";

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

  const body = await request.json();
  const status = body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : null;
  if (!status) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("requests")
    .select("*, users!requests_user_id_fkey(*)")
    .eq("id", id)
    .maybeSingle();

  if (!existing || existing.users.company_id !== owner.company_id) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Заявка уже обработана" }, { status: 409 });
  }

  const { data: updated, error: updateError } = await admin
    .from("requests")
    .update({ status, decided_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "Не удалось обновить заявку" }, { status: 500 });
  }

  const employee = existing.users;

  if (status === "approved") {
    const balanceField = existing.type === "vacation" ? "pto_balance_days" : "sick_balance_days";
    const newBalance = Number(employee[balanceField]) - Number(existing.days_count);
    await admin.from("users").update({ [balanceField]: newBalance }).eq("id", employee.id);
  }

  await notifyEmployeeOfDecision(employee, updated);

  return NextResponse.json({ ok: true, request: updated });
}
