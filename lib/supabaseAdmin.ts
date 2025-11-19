import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,            // <-- server-only URL
  process.env.SUPABASE_SERVICE_ROLE_KEY as string // <-- service role key
);
