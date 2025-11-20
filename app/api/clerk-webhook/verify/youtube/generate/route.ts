import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { channel } = await req.json();

  if (!channel) {
    return NextResponse.json({ error: "Channel is required" }, { status: 400 });
  }

  // Generate a unique verification code
  const code = "CLIP-" + Math.floor(10000 + Math.random() * 90000);

  // Initialize Supabase client (service role key)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Insert into user_verifications table
  const { error } = await supabase.from("user_verifications").insert({
    user_id: userId,
    platform: "youtube",
    username: channel,
    verification_code: code,
    is_verified: false,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ code });
}
