import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // 1. LOAD CLERK SIGNING SECRET
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!SIGNING_SECRET) {
    console.error("❌ Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const wh = new Webhook(SIGNING_SECRET);

  // 2. READ RAW BODY
  const payload = await req.text();

  // 3. READ SVIX HEADERS SAFELY
  const headers = new Headers(req.headers);

  const headerPayload = {
    "svix-id": headers.get("svix-id") || "",
    "svix-timestamp": headers.get("svix-timestamp") || "",
    "svix-signature": headers.get("svix-signature") || "",
  };

  // 4. VERIFY WEBHOOK
  let evt: any;
  try {
    evt = wh.verify(payload, headerPayload);
  } catch (err) {
    console.error("❌ Webhook Verification Failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 5. CREATE SUPABASE ADMIN CLIENT (SERVER ONLY!)
  const supabase = createClient(
    process.env.SUPABASE_URL!,             // IMPORTANT: NOT the NEXT_PUBLIC one
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Must be service role key
  );

  // 6. PROCESS USER PAYLOAD
  const user = evt.data;
  const email = user.email_addresses?.[0]?.email_address || null;

  const { data, error } = await supabase.from("users").upsert({
    clerk_id: user.id,
    email: email,
  });

  // 7. HANDLE DATABASE ERRORS
  if (error) {
    console.error("❌ SUPABASE INSERT ERROR:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  console.log("✅ SUPABASE INSERT SUCCESS:", data);

  return NextResponse.json({ success: true });
}
