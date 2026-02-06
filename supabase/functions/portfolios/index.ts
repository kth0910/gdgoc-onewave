import { createClient } from "supabase";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await verifyClerkToken(req);
    const clerkId = payload.sub as string;

    // 1. Get Supabase User ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      throw new Error("User not found in Supabase. Please sync first.");
    }

    const userId = user.id;
    const url = new URL(req.url);

    // 2. Handle Methods
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (req.method === "POST") {
      const { title, pdf_path, raw_data } = await req.json();
      const { data, error } = await supabase
        .from("portfolios")
        .insert({
          user_id: userId,
          title: title || "New Portfolio",
          pdf_path,
          raw_data,
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) throw new Error("Portfolio ID is required for deletion");

      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", id)
        .eq("user_id", userId); // Ensure ownership

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("[Portfolios] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
