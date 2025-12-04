import { createClient } from "@supabase/supabase-js";

// Admin client – server-side only
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,   // use the same URL as frontend
  process.env.SUPABASE_SERVICE_ROLE_KEY as string   // service role key
);
