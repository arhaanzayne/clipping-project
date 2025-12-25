import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const supabase = supabaseAdmin;

    const [usersRes, clipsRes, earningsRes, campaignsRes] = await Promise.all([
      supabase.from("users").select("clerk_id, email"),
      supabase.from("clips").select("user_id, status, platform, campaign_id"),
      supabase.from("earnings").select("user_id, platform, amount, campaign_id"),
      supabase.from("campaigns").select("id, name"),
    ]);

    if (usersRes.error) throw usersRes.error;
    if (clipsRes.error) throw clipsRes.error;
    if (earningsRes.error) throw earningsRes.error;
    if (campaignsRes.error) throw campaignsRes.error;

    const users = usersRes.data ?? [];
    const clips = clipsRes.data ?? [];
    const earnings = earningsRes.data ?? [];
    const campaigns = campaignsRes.data ?? [];

    // --- GLOBAL METRICS ---
    const totalUsers = users.length;
    const totalClips = clips.length;
    const totalApprovedClips = clips.filter(c => c.status === "approved").length;
    const totalCampaigns = campaigns.length;

    const totalEarnings = earnings.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // --- EARNINGS PER USER ---
    const earningsPerUser: Record<string, number> = {};
    users.forEach(u => {
      earningsPerUser[u.clerk_id] = 0;
    });

    earnings.forEach(e => {
      if (!earningsPerUser[e.user_id]) {
        earningsPerUser[e.user_id] = 0;
      }
      earningsPerUser[e.user_id] += Number(e.amount || 0);
    });

    // --- EARNINGS PER PLATFORM ---
    const earningsPerPlatform: Record<string, number> = {};
    earnings.forEach(e => {
      if (!earningsPerPlatform[e.platform]) {
        earningsPerPlatform[e.platform] = 0;
      }
      earningsPerPlatform[e.platform] += Number(e.amount || 0);
    });

    // --- EARNINGS PER USER PER PLATFORM ---
    const earningsUserPlatform: Record<string, Record<string, number>> = {};

    earnings.forEach(e => {
      if (!earningsUserPlatform[e.user_id]) {
        earningsUserPlatform[e.user_id] = {};
      }
      if (!earningsUserPlatform[e.user_id][e.platform]) {
        earningsUserPlatform[e.user_id][e.platform] = 0;
      }
      earningsUserPlatform[e.user_id][e.platform] += Number(e.amount || 0);
    });

    // --- CAMPAIGN ANALYTICS ---
    const campaignStats = campaigns.map(c => {
      const campaignClips = clips.filter(cl => cl.campaign_id === c.id);
      const approved = campaignClips.filter(cl => cl.status === "approved").length;

      const earned = earnings
        .filter(e => e.campaign_id === c.id)
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

  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
