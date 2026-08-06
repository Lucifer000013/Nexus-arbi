import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: owner } = await admin
    .from("users")
    .select("*")
    .eq("email", user.email)
    .eq("archived", false)
    .maybeSingle();
  if (!owner || owner.role !== "owner") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a name and a valid email" }, { status: 400 });
  }

  const { data: settings } = await admin
    .from("company_settings")
    .select("*")
    .eq("company_id", owner.company_id)
    .maybeSingle();

  const { data: created, error } = await admin
    .from("users")
    .insert({
      company_id: owner.company_id,
      name,
      email,
      role: "employee",
      pto_balance_days: settings?.default_pto_days_per_year ?? 0,
      sick_balance_days: settings?.default_sick_days_per_year ?? 0,
    })
    .select()
    .single();

  if (error) {
    const message = error.code === "23505" ? "An employee with this email already exists" : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, employee: created });
}
