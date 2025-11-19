import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  const wh = new Webhook(SIGNING_SECRET);

  const payload = await req.text();

  // SAFE HEADERS FIX
  const incomingHeaders = new Headers(req.headers);

  const svixId = incomingHeaders.get("svix-id") || "";
  const svixTimestamp = incomingHeaders.get("svix-timestamp") || "";
  const svixSignature = incomingHeaders.get("svix-signature") || "";

  const headerPayload = {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  };

  let evt: any;
  try {
    evt = wh.verify(payload, headerPayload);
  } catch (err) {
    console.error("Webhook Verification Failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const user = evt.data;
  const email = user.email_addresses?.[0]?.email_address;

  await supabase.from("users").upsert({
    clerk_id: user.id,
    email,
  });

  return NextResponse.json({ success: true });
}
