import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  // 👇 Changed this part
  if (!userId) {
    // When there is no logged-in user, just return an empty list
    // instead of 401 to avoid the console error.
    return NextResponse.json({ accounts: [] }, { status: 200 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("user_verifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_verified", true)
    .order("verified_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ accounts: data });
}
