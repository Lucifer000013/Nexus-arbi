import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { countBusinessDays } from "@/lib/business-days";
import { notifyOwnerOfNewRequest } from "@/lib/email";
import type { RequestType } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("*")
    .eq("email", user.email)
    .eq("archived", false)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }

  const body = await request.json();
  const type: RequestType = body.type === "sick" ? "sick" : "vacation";
  const startDate = String(body.start_date ?? "");
  const endDate = String(body.end_date ?? "");
  const reason = body.reason ? String(body.reason).trim().slice(0, 1000) : null;

  const daysCount = countBusinessDays(startDate, endDate);
  if (daysCount <= 0) {
    return NextResponse.json(
      { error: "Please select a valid range of business days" },
      { status: 400 }
    );
  }

  const { data: created, error } = await admin
    .from("requests")
    .insert({
      user_id: profile.id,
      type,
      start_date: startDate,
      end_date: endDate,
      days_count: daysCount,
      reason,
      status: "pending",
    })
    .select()
    .single();

  if (error || !created) {
    return NextResponse.json({ error: error?.message ?? "Couldn't create the request" }, { status: 500 });
  }

  const { data: owner } = await admin
    .from("users")
    .select("*")
    .eq("company_id", profile.company_id)
    .eq("role", "owner")
    .maybeSingle();
  if (owner) {
    await notifyOwnerOfNewRequest(owner, profile, created);
  }

  return NextResponse.json({ ok: true, request: created });
}
