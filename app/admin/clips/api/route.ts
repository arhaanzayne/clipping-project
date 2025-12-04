import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET  → list all clips
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("clips")
      .select(
        "id, user_id, campaign_id, campaign_name, user_email, platform, account_username, clip_url, status, earnings, created_at, views"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN GET CLIPS ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clips: data ?? [] });
  } catch (err: any) {
    console.error("ADMIN GET CLIPS ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

// POST → approve / reject + create earnings row
export async function POST(req: Request) {
  try {
    const { clip, status } = await req.json();

    if (!clip?.id || !status) {
      return NextResponse.json(
        { error: "Missing clip or status" },
        { status: 400 }
      );
    }

    // If rejected → just mark rejected and zero earnings
    if (status === "rejected") {
      const { error: rejectError } = await supabaseAdmin
        .from("clips")
        .update({ status: "rejected", earnings: 0 })
        .eq("id", clip.id);

      if (rejectError) {
        console.error("REJECT UPDATE ERROR:", rejectError);
        return NextResponse.json(
          { error: rejectError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // APPROVE FLOW

    // 1) Fetch campaign RPMs
    const { data: campaign, error: campError } = await supabaseAdmin
      .from("campaigns")
      .select("rpm_youtube, rpm_tiktok, rpm_instagram, rpm_x")
      .eq("id", clip.campaign_id)
      .single();

    if (campError || !campaign) {
      console.error("CAMPAIGN FETCH ERROR:", campError);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // 2) Determine RPM based on platform
    let rpm = 0;
    if (clip.platform === "youtube") rpm = campaign.rpm_youtube;
    else if (clip.platform === "tiktok") rpm = campaign.rpm_tiktok;
    else if (clip.platform === "instagram") rpm = campaign.rpm_instagram;
    else if (clip.platform === "x") rpm = campaign.rpm_x;

    const views = Number(clip.views || 0);
    const earningsAmount = (views / 1000) * rpm;

    // 3) Insert into earnings table
    const { error: earnError } = await supabaseAdmin.from("earnings").insert({
      clip_id: clip.id,
      user_id: clip.user_id,
      platform: clip.platform,
      amount: earningsAmount,
    });

    if (earnError) {
      console.error("EARNINGS INSERT ERROR:", earnError);
      return NextResponse.json({ error: earnError.message }, { status: 500 });
    }

    // 4) Update clip row with status + earnings
    const { error: updateError } = await supabaseAdmin
      .from("clips")
      .update({ status: "approved", earnings: earningsAmount })
      .eq("id", clip.id);

    if (updateError) {
      console.error("CLIP STATUS UPDATE ERROR:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      calculated_earnings: earningsAmount,
    });
  } catch (err: any) {
    console.error("ADMIN CLIPS POST ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
