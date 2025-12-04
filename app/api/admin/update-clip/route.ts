import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    // 1. FETCH CLIP DETAILS
    const { data: clip, error: clipError } = await supabaseAdmin
      .from("clips")
      .select("id, user_id, platform, views, campaign_id")
      .eq("id", id)
      .single();

    if (clipError || !clip) {
      return NextResponse.json(
        { error: "Clip not found" },
        { status: 404 }
      );
    }

    // If REJECTED → just update status
    if (status === "rejected") {
      await supabaseAdmin
        .from("clips")
        .update({ status })
        .eq("id", id);

      return NextResponse.json({ success: true });
    }

    // 2. FETCH CAMPAIGN FOR RPM DATA
    const { data: campaign, error: campError } = await supabaseAdmin
      .from("campaigns")
      .select(
        "rpm_youtube, rpm_tiktok, rpm_instagram, rpm_x"
      )
      .eq("id", clip.campaign_id)
      .single();

    if (campError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // 3. DETERMINE RPM BASED ON PLATFORM
    let rpm = 0;
    if (clip.platform === "youtube") rpm = campaign.rpm_youtube;
    if (clip.platform === "tiktok") rpm = campaign.rpm_tiktok;
    if (clip.platform === "instagram") rpm = campaign.rpm_instagram;
    if (clip.platform === "x") rpm = campaign.rpm_x;

    // 4. CALCULATE EARNINGS
    const earningsAmount = (clip.views / 1000) * rpm;

    // 5. INSERT INTO EARNINGS TABLE
    await supabaseAdmin.from("earnings").insert({
      clip_id: clip.id,
      user_id: clip.user_id,
      platform: clip.platform,
      amount: earningsAmount,
    });

    // 6. UPDATE CLIP STATUS
    await supabaseAdmin
      .from("clips")
      .update({ status: "approved" })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      calculated_earnings: earningsAmount,
    });

  } catch (err: any) {
    console.error("ADMIN UPDATE CLIP ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
