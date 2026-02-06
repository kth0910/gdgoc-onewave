import { createClient } from "supabase";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await verifyClerkToken(req);
    const clerkId = payload.sub as string;

    if (!clerkId) {
      throw new Error("Clerk ID not found in token");
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // GET /user/credit
    if (req.method === "GET" && pathSegments.includes("credit")) {
      const { data, error } = await supabase
        .from("users")
        .select("credits")
        .eq("clerk_id", clerkId)
        .single();

      if (error) {
        console.error("[User Credit] GET Error:", error.message);
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // PATCH /user/credit
    if (req.method === "PATCH" && pathSegments.includes("credit")) {
      const { credits } = await req.json();

      if (credits === undefined) {
        throw new Error("credits field is required");
      }

      const { data, error } = await supabase
        .from("users")
        .update({ credits })
        .eq("clerk_id", clerkId)
        .select("credits")
        .single();

      if (error) {
        console.error("[User Credit] PATCH Error:", error.message);
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response("Method or Path not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  } catch (error) {
    console.error("[User Credit] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
