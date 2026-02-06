import { createClient } from "supabase";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
  "Access-Control-Allow-Credentials": "true",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await verifyClerkToken(req);
    const clerkId = payload.sub as string;
    
    // Attempt to get email and name from common Clerk JWT claims
    const email = (payload.email as string) || (payload.email_addresses as any)?.[0]?.email_address;
    const fullName = (payload.full_name as string) || `${payload.first_name || ""} ${payload.last_name || ""}`.trim();

    if (!clerkId) {
      throw new Error("Clerk ID not found in token");
    }

    console.log(`[Auth Sync] Syncing user: ${clerkId}`);

    // Upsert into users table
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_id: clerkId,
          email: email || `user_${clerkId.slice(-8)}@clerk.com`,
          full_name: fullName || "User",
        },
        { onConflict: "clerk_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[Auth Sync] Error:", error.message);
      throw error;
    }

    return new Response(JSON.stringify({ user: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Auth Sync] Failure:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message === "Invalid token" ? 401 : 400,
    });
  }
});
