import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { verificationId } = await req.json();

  if (!verificationId) {
    return NextResponse.json({ error: "Missing verificationId" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1️⃣ Fetch record from DB
  const { data, error } = await supabase
    .from("user_verifications")
    .select("*")
    .eq("id", verificationId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Verification record not found" },
      { status: 404 }
    );
  }

  const { username, verification_code } = data;

  // 2️⃣ Call Apify (you will configure this later)
  const apifyRes = await fetch(
    `https://api.apify.com/v2/actor-tasks/YOUR_TWITTER_APIFY_TASK_ID/run-sync?token=${process.env.APIFY_TOKEN}`,
    {
      method: "POST",
      body: JSON.stringify({
        usernames: [username],
      }),
      headers: { "Content-Type": "application/json" },
    }
  );

  const apifyData = await apifyRes.json();

  // Extract Twitter bio
  const bio = apifyData?.items?.[0]?.description || "";

  // 3️⃣ Compare code
  if (!bio.includes(verification_code)) {
    return NextResponse.json({
      verified: false,
      message: "Code not found in Twitter bio",
    });
  }

  // 4️⃣ Update DB
  await supabase
    .from("user_verifications")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  return NextResponse.json({
    verified: true,
    message: "Twitter account verified!",
  });
}
