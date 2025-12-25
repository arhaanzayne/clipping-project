import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = supabaseAdmin;

    const [usersRes, clipsRes, earningsRes, campaignsRes] = await Promise.all([
      supabase.from("users").select("clerk_id, email"),
      supabase.from("clips").select("user_id, status, platform, campaign_id"),
      supabase.from("earnings").select("user_id, platform, amount"),
      supabase.from("campaigns").select("id, name"),
    ]);

    if (usersRes.error) {
      console.error("Users error:", usersRes.error);
      return NextResponse.json({ error: usersRes.error.message }, { status: 500 });
    }
    if (clipsRes.error) {
      console.error("Clips error:", clipsRes.error);
      return NextResponse.json({ error: clipsRes.error.message }, { status: 500 });
    }
    if (earningsRes.error) {
      console.error("Earnings error:", earningsRes.error);
      return NextResponse.json({ error: earningsRes.error.message }, { status: 500 });
    }
    if (campaignsRes.error) {
      console.error("Campaigns error:", campaignsRes.error);
      return NextResponse.json({ error: campaignsRes.error.message }, { status: 500 });
    }

    const users = usersRes.data ?? [];
    const clips = clipsRes.data ?? [];
    const earnings = earningsRes.data ?? [];
    const campaigns = campaignsRes.data ?? [];

    // --- GLOBAL METRICS ---
    const totalUsers = users.length;
    const totalClips = clips.length;
    const totalApprovedClips = clips.filter((c) => c.status === "approved").length;
    const totalCampaigns = campaigns.length;

    const totalEarnings = earnings.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // --- EARNINGS PER USER ---
    const earningsPerUser: Record<string, number> = {};
    earnings.forEach((e) => {
      const uid = e.user_id;
      if (!earningsPerUser[uid]) earningsPerUser[uid] = 0;
      earningsPerUser[uid] += Number(e.amount || 0);
    });

    // --- EARNINGS PER PLATFORM ---
    const earningsPerPlatform: Record<string, number> = {};
    earnings.forEach((e) => {
      const p = e.platform || "unknown";
      if (!earningsPerPlatform[p]) earningsPerPlatform[p] = 0;
      earningsPerPlatform[p] += Number(e.amount || 0);
    });

    // --- EARNINGS PER USER PER PLATFORM ---
    const earningsUserPlatform: Record<string, Record<string, number>> = {};
    earnings.forEach((e) => {
      const uid = e.user_id;
      const p = e.platform || "unknown";
      if (!earningsUserPlatform[uid]) earningsUserPlatform[uid] = {};
      if (!earningsUserPlatform[uid][p]) earningsUserPlatform[uid][p] = 0;
      earningsUserPlatform[uid][p] += Number(e.amount || 0);
    });

    // --- CAMPAIGN ANALYTICS (best-effort without earnings.campaign_id) ---
    const campaignStats = campaigns.map((c) => {
      const campaignClips = clips.filter(
        (cl) => String(cl.campaign_id) === String(c.id)
      );
      const approved = campaignClips.filter((cl) => cl.status === "approved").length;

      const campaignUserIds = new Set(campaignClips.map((cl) => cl.user_id));
      const earned = earnings
        .filter((e) => campaignUserIds.has(e.user_id))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      return {
        id: c.id,
        name: c.name,
        total_clips: campaignClips.length,
        approved_clips: approved,
        total_earnings: earned,
      };
    });

    // --- LEADERBOARD ---
    const leaderboard = Object.entries(earningsPerUser)
      .map(([user_id, total]) => ({ user_id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return NextResponse.json({
      totals: {
        totalUsers,
        totalClips,
        totalApprovedClips,
        totalCampaigns,
        totalEarnings,
      },
      earningsPerUser,
      earningsPerPlatform,
      earningsUserPlatform,
      campaignStats,
      leaderboard,
    });
  } catch (err: any) {
    console.error("Admin analytics fatal error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
