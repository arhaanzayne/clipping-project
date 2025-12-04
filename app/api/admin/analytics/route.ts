import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabase = supabaseAdmin;

  // Run all queries in parallel
  const [usersRes, clipsRes, earningsRes, campaignsRes] = await Promise.all([
    supabase.from("users").select("clerk_id, email"),
    supabase.from("clips").select("user_id, status, platform, campaign_id"),
    supabase.from("earnings").select("user_id, platform, amount"),
    supabase.from("campaigns").select("id, name"),
  ]);

  // Handle errors individually
  if (usersRes.error) {
    console.error("Users error:", usersRes.error);
    return NextResponse.json({ error: "Failed fetching users" }, { status: 500 });
  }
  if (clipsRes.error) {
    console.error("Clips error:", clipsRes.error);
    return NextResponse.json({ error: "Failed fetching clips" }, { status: 500 });
  }
  if (earningsRes.error) {
    console.error("Earnings error:", earningsRes.error);
    return NextResponse.json({ error: "Failed fetching earnings" }, { status: 500 });
  }
  if (campaignsRes.error) {
    console.error("Campaigns error:", campaignsRes.error);
    return NextResponse.json({ error: "Failed fetching campaigns" }, { status: 500 });
  }

  // Extract data safely
  const users = usersRes.data || [];
  const clips = clipsRes.data || [];
  const earnings = earningsRes.data || [];
  const campaigns = campaignsRes.data || [];

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
  users.forEach((u) => (earningsPerUser[u.clerk_id] = 0));
  earnings.forEach((e) => {
    earningsPerUser[e.user_id] =
      (earningsPerUser[e.user_id] || 0) + Number(e.amount || 0);
  });

  // --- EARNINGS PER PLATFORM ---
  const earningsPerPlatform: Record<string, number> = {};
  earnings.forEach((e) => {
    earningsPerPlatform[e.platform] =
      (earningsPerPlatform[e.platform] || 0) + Number(e.amount || 0);
  });

  // --- EARNINGS PER USER PER PLATFORM ---
  const earningsUserPlatform: Record<string, Record<string, number>> = {};
  users.forEach((u) => (earningsUserPlatform[u.clerk_id] = {}));
  earnings.forEach((e) => {
    if (!earningsUserPlatform[e.user_id][e.platform]) {
      earningsUserPlatform[e.user_id][e.platform] = 0;
    }
    earningsUserPlatform[e.user_id][e.platform] += Number(e.amount || 0);
  });

  // --- CAMPAIGN ANALYTICS ---
  const campaignStats = campaigns.map((c) => {
    const campaignClips = clips.filter((cl) => cl.campaign_id === c.id);
    const approved = campaignClips.filter((cl) => cl.status === "approved").length;

    const earned = earnings
      .filter((e) => campaignClips.some((cl) => cl.user_id === e.user_id))
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
}
