import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ONE route that handles:
// - GET (no params)      → list clips
// - GET with action=...  → approve / reject + create earnings
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // 🔹 ACTION MODE: approve / reject
    if (action === "update") {
      const id = searchParams.get("id");
      const status = searchParams.get("status");

      if (!id || !status) {
        return NextResponse.json(
          { error: "Missing id or status" },
          { status: 400 }
        );
      }

      // 1. Fetch clip
      const { data: clip, error: clipError } = await supabaseAdmin
        .from("clips")
        .select("id, user_id, platform, views, campaign_id")
        .eq("id", id)
        .single();

      if (clipError || !clip) {
        console.error("CLIP FETCH ERROR:", clipError);
        return NextResponse.json(
          { error: "Clip not found" },
          { status: 404 }
        );
      }

      // If rejected → just update status
      if (status === "rejected") {
        const { error: rejectError } = await supabaseAdmin
          .from("clips")
          .update({ status })
          .eq("id", id);

        if (rejectError) {
          console.error("REJECT UPDATE ERROR:", rejectError);
          return NextResponse.json(
            { error: rejectError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      }

      // 2. Fetch campaign RPMs
      const { data: campaign, error: campError } = await supabaseAdmin
        .from("campaigns")
        .select(
          "rpm_youtube, rpm_tiktok, rpm_instagram, rpm_x"
        )
        .eq("id", clip.campaign_id)
        .single();

      if (campError || !campaign) {
        console.error("CAMPAIGN FETCH ERROR:", campError);
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      // 3. Determine RPM by platform
      let rpm = 0;
      if (clip.platform === "youtube") rpm = campaign.rpm_youtube;
      if (clip.platform === "tiktok") rpm = campaign.rpm_tiktok;
      if (clip.platform === "instagram") rpm = campaign.rpm_instagram;
      if (clip.platform === "x") rpm = campaign.rpm_x;

      const views = Number(clip.views || 0);
      const earningsAmount = (views / 1000) * rpm;

      // 4. Insert into earnings table
      const { error: earnError } = await supabaseAdmin
        .from("earnings")
        .insert({
          clip_id: clip.id,
          user_id: clip.user_id,
          platform: clip.platform,
          amount: earningsAmount,
        });

      if (earnError) {
        console.error("EARNINGS INSERT ERROR:", earnError);
        return NextResponse.json(
          { error: earnError.message },
          { status: 500 }
        );
      }

      // 5. Update clip status
      const { error: updateError } = await supabaseAdmin
        .from("clips")
        .update({ status: "approved" })
        .eq("id", id);

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
    }

    // 🔹 DEFAULT MODE: list clips (no action param)
    const { data, error } = await supabaseAdmin
      .from("clips")
      .select(
        "id, user_id, campaign_id, campaign_name, user_email, platform, account_username, clip_url, status, earnings, created_at"
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
