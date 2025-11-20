import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    // Get the currently logged-in user from Clerk
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const body = await req.json();
    const { clip_url, verified_account_id, platform } = body;

    if (!clip_url || !verified_account_id || !platform) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowedPlatforms = ["instagram", "tiktok", "youtube", "x"];
    if (!allowedPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    // Make sure the verified account belongs to this user
    const { data: account, error: accountError } = await supabaseAdmin
      .from("user_verifications")
      .select("*")
      .eq("id", verified_account_id)
      .eq("user_id", userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "Account not found or does not belong to user" },
        { status: 403 }
      );
    }

    // Insert clip into clips table
    const { error: insertError } = await supabaseAdmin.from("clips").insert({
      user_id: userId,
      verified_account_id,
      account_username: account.username,
      platform,
      clip_url,
      status: "pending",
      earnings: 0,
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { error: "Database insertion error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Clip submitted!" });
  } catch (error) {
    console.error("submit-clip API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
