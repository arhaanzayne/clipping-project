import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ----------------------
// GET: Load all payouts
// ----------------------
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_payouts")
      .select("*")
      .order("user_id", { ascending: true });

    if (error) {
      console.error("Admin payouts fetch error:", error);
      return NextResponse.json({ payouts: [] }, { status: 500 });
    }

    return NextResponse.json({ payouts: data || [] });
  } catch (err) {
    console.error("ADMIN PAYOUTS ROUTE FAILED:", err);
    return NextResponse.json({ payouts: [] }, { status: 500 });
  }
}

// ----------------------
// POST: Approve / Reject payout
// ----------------------
export async function POST(req: Request) {
  try {
    const { payout, status } = await req.json();

    if (!payout?.id) {
      return NextResponse.json(
        { error: "Missing payout ID" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("user_payouts")
      .update({ status })
      .eq("id", payout.id);

    if (error) {
      console.error("PAYOUT UPDATE ERROR:", error);
      return NextResponse.json(
        { error: "Failed to update payout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("ADMIN PAYOUTS POST ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
