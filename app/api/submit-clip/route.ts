import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function detectPlatform(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("instagram")) return "instagram";
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("twitter") || lower.includes("x.com")) return "x";
  return "unknown";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("submit-clip BODY:", body);

    const clip_url = body.clip_url;
    const verified_account_id = body.verified_account_id;
    const campaign_id = body.campaign_id;
    const user_id = body.user_id;
    const platform = body.platform || (clip_url ? detectPlatform(clip_url) : "unknown");

    if (!clip_url || !verified_account_id || !campaign_id) {
      return NextResponse.json(
        { error: "Missing fields (clip_url, verified_account_id, campaign_id)." },
        { status: 400 }
      );
    }

    // ---------------------------
    // 1) Fetch verified account
    // ---------------------------
    const { data: accountData, error: accError } = await supabaseAdmin
      .from("user_verifications")
      .select("username, platform, user_id")
      .eq("id", verified_account_id)
      .single();

    if (accError || !accountData) {
      console.error("ACCOUNT LOOKUP ERROR:", accError);
      return NextResponse.json(
        { error: "Verified account not found." },
        { status: 400 }
      );
    }

    const finalUserId = user_id || accountData.user_id;

    // ---------------------------
    // 2) Fetch campaign name
    // ---------------------------
    const { data: campaignData, error: campError } = await supabaseAdmin
      .from("campaigns")
      .select("name")
      .eq("id", campaign_id)
      .single();

    if (campError || !campaignData) {
      console.error("CAMPAIGN LOOKUP ERROR:", campError);
      return NextResponse.json(
        { error: "Campaign not found." },
        { status: 400 }
      );
    }

    // ---------------------------
    // 3) Fetch email from users table
    // ---------------------------
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("clerk_id", finalUserId)   // ✅ CORRECT
      .single();

    const email = userData?.email || null;

    // ---------------------------
    // 4) Insert clip with extras
    // ---------------------------
    const { error: insertError } = await supabaseAdmin.from("clips").insert([
      {
        campaign_id,
        campaign_name: campaignData.name, // ⭐ FIX
        user_id: finalUserId,
        user_email: email,                 // ⭐ FIX
        platform: platform === "unknown" ? accountData.platform : platform,
        verified_account_id,
        account_username: accountData.username,
        clip_url,
        status: "pending",
        earnings: 0,
      },
    ]);

    if (insertError) {
      console.error("CLIP INSERT ERROR:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("submit-clip API ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
