import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// --------- GET: load payout settings for given user_id ----------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json(null, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("user_payouts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("GET /api/payout/settings error:", error);
    return NextResponse.json(null);
  }

  return NextResponse.json(data || null);
}

// --------- POST: save payout settings for given user_id ----------
export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.user_id as string | undefined;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing user_id" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("user_payouts")
    .upsert({
      user_id: userId,
      paypal_email: body.paypal_email ?? "",
      legal_name: body.legal_name ?? "",
      bank_name: body.bank_name ?? "",
      account_number: body.account_number ?? "",
      ifsc_swift: body.ifsc_swift ?? "",
      country: body.country ?? "",
      address: body.address ?? "",
      phone: body.phone ?? "",
    })
    .select()
    .single();

  if (error) {
    console.error("POST /api/payout/settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
