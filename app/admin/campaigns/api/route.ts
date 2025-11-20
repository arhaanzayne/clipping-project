import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming data:", body);

    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .insert([
        {
          name: body.name,
          description: body.description,
          rpm_youtube: body.rpm_youtube,
          rpm_tiktok: body.rpm_tiktok,
          rpm_instagram: body.rpm_instagram,
          rpm_x: body.rpm_x,
          sop_text: body.sop_text,
          sop_url: body.sop_url,
          enabled_platforms: body.enabledPlatforms,
        },
      ])
      .select("*");

    if (error) {
      console.log("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Insert Success:", data);
    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.log("Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
