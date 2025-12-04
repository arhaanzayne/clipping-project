import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabase = supabaseAdmin;

  // Fetch users (including clerk_id)
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, clerk_id, email, created_at");

  if (userError) {
    console.log("USER ERROR:", userError);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Fetch clips
  const { data: clips, error: clipError } = await supabase
    .from("clips")
    .select("id, user_id, status");

  if (clipError) {
    console.log("CLIP ERROR:", clipError);
    return NextResponse.json({ error: clipError.message }, { status: 500 });
  }

  // Build Analytics
  const result = users.map((u) => {
    const approvedClips = clips.filter(
      (c) => c.user_id === u.clerk_id && c.status === "approved"
    ).length;

    return {
      ...u,
      total_approved_clips: approvedClips,
      total_earnings: 0,
    };
  });

  return NextResponse.json(result);
}
