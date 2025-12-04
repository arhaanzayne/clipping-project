import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// CREATE CAMPAIGN
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming POST data:", body);

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
          enabled_platforms: body.enabled_platforms,
        },
      ])
      .select("*");

    if (error) {
      console.log("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.log("Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE CAMPAIGN
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming PUT data:", body);

    // id MUST come from body
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing campaign ID" },
        { status: 400 }
      );
    }

    const updatedData = {
      name: body.name ?? "",
      description: body.description ?? "",
      rpm_youtube: body.rpm_youtube ?? 0,
      rpm_tiktok: body.rpm_tiktok ?? 0,
      rpm_instagram: body.rpm_instagram ?? 0,
      rpm_x: body.rpm_x ?? 0,
      sop_text: body.sop_text ?? "",
      sop_url: body.sop_url ?? "",
      enabled_platforms: body.enabled_platforms ?? {
        youtube: false,
        tiktok: false,
        instagram: false,
        x: false,
      },
    };

    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .update(updatedData)
      .eq("id", id)
      .select("*");

    if (error) {
      console.log("Supabase Update Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.log("PUT Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
